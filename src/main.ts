import { config } from "./config.ts";
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

    const already_downloaded_songs = Deno.readTextFileSync(
        `${config.output_dir}/download.log`,
    ).split("\n");
    console.log("Retrieving song list...");
    const songs = await spotify_api.get_playlist_songs(
        playlist_id,
        already_downloaded_songs,
    );

    if (songs.length === 0) {
        console.log(
            "No songs to download, make sure that the playlist id is correct. It is also possible that all songs are already marked as downloaded, remove 'download.log' from the output directory and try again",
        );
        Deno.exit(1);
    }

    const doDownload = confirm(
        already_downloaded_songs.length > 0
            ? `Download ${songs.length} songs? (${already_downloaded_songs.length} already downloaded)`
            : `Download ${songs.length} songs?`,
    );

    if (doDownload) downloadSongs(songs);
    else console.error("Download cancelled");
} catch (err) {
    console.error(`%c${err.message}`, "color: red;");
    Deno.exit(1);
}
