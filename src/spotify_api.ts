import { Hono } from "@hono/hono";
import { safeParse } from "@valibot/valibot";
import open from "npm:open";
import {
    spotify_auth_token_schema,
    spotify_playlist_tracks_response_schema,
    type SpotifyAPI,
    type SpotifyAuth,
} from "./schemas.ts";

const SERVER_PORT = 8372;
const BASE_SERVER_URL = `http://localhost:${SERVER_PORT}`;
const hono = new Hono();
const oauthCallbackWebServer = Deno.serve({ port: SERVER_PORT }, hono.fetch);

export async function create_spotify_api_client(
    client_id: string,
    client_secret: string,
): Promise<SpotifyAPI> {
    const auth_data = await get_access_token(client_id, client_secret);

    return {
        ...auth_data,
        async get_playlist_song_titles(playlist_id) {
            const url = new URL(
                `https://api.spotify.com/v1/playlists/${playlist_id}/tracks`,
            );
            url.searchParams.set("fields", "items(track(name,artists(name)))");

            const response = await fetch(url, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${auth_data.access_token}`,
                },
            }).then(async (res) => {
                switch (res.status) {
                    case 200:
                        return res.json();

                    case 401:
                        throw new Error("Bad or expired token");

                    case 404:
                        throw new Error(
                            `No playlist found with ID '${playlist_id}'`,
                        );

                    case 403:
                        throw new Error("Bad OAuth request");

                    case 429:
                        throw new Error("Exceeded rate limits");

                    default:
                        throw new Error(await res.text());
                }
            });

            const parsed_response = safeParse(
                spotify_playlist_tracks_response_schema,
                response,
            );

            if (!parsed_response.success) {
                throw new Error(
                    `Error parsing playlist tracks response (${
                        JSON.stringify(parsed_response.issues)
                    })`,
                );
            }

            return parsed_response.output.items.map(({ track }) => {
                const artists = track.artists.reduce(
                    (artists_names, artist, index) => {
                        const separator = index !== 0 ? ", " : "";

                        return artists_names += separator + artist.name;
                    },
                    "",
                );

                return `${track.name} ${artists}`;
            });
        },
    };
}

export function get_access_token(client_id: string, client_secret: string) {
    const requestIdentifier = getRandomString(8);
    const { promise, resolve, reject } = Promise.withResolvers<
        SpotifyAuth
    >();

    try {
        // This uses the web server initialized previously and creates and endpoint
        // used to recive the OAuth2 callback
        hono.get("/callback", async (c) => {
            const error = c.req.query("error");

            if (error) {
                reject(`Error while authorizating Spotify API: '${error}'`);
                return c.text(
                    `Error while authorizating Spotify API: '${error}'`,
                );
            }

            const state = c.req.query("state");

            if (state !== requestIdentifier) {
                reject("Authorization request identifiers do not match");
                return c.text("Authorization request identifiers do not match");
            }

            const code = c.req.query("code");

            if (code === undefined) {
                reject("Spotify response did not contain authorization code");
                return c.text(
                    "Spotify response did not contain authorization code",
                );
            }

            const access_token_response = await fetch(
                "https://accounts.spotify.com/api/token",
                {
                    method: "POST",
                    headers: {
                        "accept": "application/json",
                        "content-type": "application/x-www-form-urlencoded",
                        "Authorization": "Basic " +
                            btoa(`${client_id}:${client_secret}`),
                    },
                    body: new URLSearchParams({
                        code,
                        redirect_uri: `${BASE_SERVER_URL}/callback`,
                        grant_type: "authorization_code",
                    }),
                },
            ).then((res) => res.json())
                .then((access_token_response) =>
                    safeParse(
                        spotify_auth_token_schema,
                        access_token_response,
                    )
                );

            if (access_token_response.success) {
                resolve(access_token_response.output);
                return c.text(
                    "Authorized successfully, you can close this tab",
                );
            } else {
                reject(
                    `Spotify response did not match expected schema: ${
                        JSON.stringify(access_token_response.issues)
                    }`,
                );
                return c.text(
                    "The response from Spotify does not have the expected format, check the console for further details",
                );
            }
        });

        // This makes the default endpoint of the webserver a redirect to Spotify's OAuth2
        // login, which then makes a request to the 'callback' endpoint defined above
        hono.get("/", (c) => {
            const url = new URL("https://accounts.spotify.com/authorize");

            url.searchParams.set("response_type", "code");
            url.searchParams.set("client_id", client_id);
            url.searchParams.set("scope", "playlist-read-private");
            url.searchParams.set("redirect_uri", `${BASE_SERVER_URL}/callback`);
            url.searchParams.set("state", requestIdentifier);
            url.searchParams.set("show_dialog", "true");

            setTimeout(
                () =>
                    reject(
                        "Got no response after 15s, check your browser for errors",
                    ),
                15000,
            );

            return c.redirect(url.toString());
        });

        // Open the page that redirect to the OAuth2 login in the user's default browser
        open(BASE_SERVER_URL);
        // When the promise is either fulfilled or rejected, shutdown the HTTP server
        promise.finally(oauthCallbackWebServer.shutdown);
    } catch (err) {
        console.error(err);
        oauthCallbackWebServer.shutdown();
    }

    return promise;
}

function getRandomString(length: number) {
    if (length % 2 == 1) {
        throw new Deno.errors.InvalidData("Only whole numbers are supported");
    }

    const buf = new Uint8Array(length / 2);
    crypto.getRandomValues(buf);

    return buf.reduce((output, byte) => {
        return output += ("0" + byte.toString(16)).slice(-2);
    }, "");
}
