import * as v from "@valibot/valibot";

export const spotify_auth_token_schema = v.object({
    access_token: v.string(),
    token_type: v.literal("Bearer"),
    scope: v.string(),
    expires_in: v.number(),
    refresh_token: v.string(),
});

// INFO: The actual response returned by Spotify's API contains a lot more fields
// but for the purpose of this app they are irrelevant
export const spotify_playlist_tracks_response_schema = v.object({
    items: v.array(v.object({
        track: v.object({
            name: v.string(),
            artists: v.array(v.object({
                name: v.string(),
            })),
        }),
    })),
});

// #region ---------------------------------------- Typescript Types ----------------------------------------
export type SpotifyAPI = SpotifyAuth & {
    get_playlist_song_titles(playlist_id: string): Promise<string[]> | string[];
};

export type SpotifyAuth = v.InferOutput<typeof spotify_auth_token_schema>;
export type SpotifyPlaylistTrack = v.InferOutput<
    typeof spotify_playlist_tracks_response_schema
>;
