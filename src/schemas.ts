import * as v from "@valibot/valibot";

export const config_file_schema = v.object({
    client_id: v.string("Missing Spotify API client id ('client_id')"),
    client_secret: v.string(
        "Missing Spotify API client secret ('client_secret')",
    ),
    output_dir: v.string(
        "Missing output directory from config file ('output_dir')",
    ),
});

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
            id: v.string(),
            name: v.string(),
            artists: v.array(v.object({
                name: v.string(),
            })),
        }),
    })),
});

// #region ---------------------------------------- Typescript Types ----------------------------------------
export type SpotifySong = {
    id: string;
    name: string;
};
export type SpotifyAPI = SpotifyAuth & {
    get_playlist_songs(
        playlist_id: string,
        excluded_ids: Array<string>,
    ): Promise<SpotifySong[]> | SpotifySong[];
};

export type SpotifyAuth = v.InferOutput<typeof spotify_auth_token_schema>;
export type SpotifyPlaylistTrack = v.InferOutput<
    typeof spotify_playlist_tracks_response_schema
>;
