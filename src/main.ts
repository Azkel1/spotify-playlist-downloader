import config from "../config.json" with { type: "json" };
import { downloadSongs } from "./downloader.ts";
import { create_spotify_api_client } from "./spotify_api.ts";

try {
  const playlist_id = prompt("Enter the playlist ID:");

  if (playlist_id === null) {
    console.error("A playlist ID is required");
    Deno.exit(1);
  }

  console.log(playlist_id);

  const spotify_api = await create_spotify_api_client(
    config.client_id,
    config.client_secret,
  );

  const songs = await spotify_api.get_playlist_song_titles(
    playlist_id,
  );

  downloadSongs(songs);
} catch (err) {
  console.error(`%c${err.message}`, "color: red;");
}
