import config from "../config.json" with { type: "json" };
import { downloadSongs } from "./downloader.ts";
import { create_spotify_api_client } from "./spotify_api.ts";

try {
    const spotify_api = await create_spotify_api_client(
        config.client_id,
        config.client_secret,
    );

    const playlist_id = prompt("Enter the playlist ID:")?.trim();

    if (!playlist_id) {
        console.error("A playlist ID is required");
        Deno.exit(1);
    }

    console.log("Retrieving song list...");
    const songs = await spotify_api.get_playlist_song_titles(
        playlist_id,
    );

    const doDownload = confirm(`Download ${songs.length} songs?`);

    if (doDownload) downloadSongs(songs);
    else console.error("Download cancelled");
} catch (err) {
    console.error(`%c${err.message}`, "color: red;");
}
