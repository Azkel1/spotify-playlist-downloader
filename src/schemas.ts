import {
  array,
  literal,
  number,
  object,
  type Output,
  string,
} from "https://deno.land/x/valibot@v0.28.1/mod.ts";

export const spotify_auth_token_schema = object({
  access_token: string(),
  token_type: literal("Bearer"),
  scope: string(),
  expires_in: number(),
  refresh_token: string(),
});

// INFO: The actual response returned by Spotify's API contains a lot more fields
// but for the purpose of this app they are irrelevant
export const spotify_playlist_tracks_response_schema = object({
  items: array(object({
    track: object({
      name: string(),
      artists: array(object({
        name: string(),
      })),
    }),
  })),
});

// #region ---------------------------------------- Typescript Types ----------------------------------------
export type SpotifyAPI = SpotifyAuth & {
  get_playlist_song_titles(playlist_id: string): Promise<string[]> | string[];
};

export type SpotifyAuth = Output<typeof spotify_auth_token_schema>;
export type SpotifyPlaylistTrack = Output<
  typeof spotify_playlist_tracks_response_schema
>;
