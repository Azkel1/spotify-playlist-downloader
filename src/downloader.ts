// yt-dlp.exe ytsearch:"<song name>" -x --audio-format mp3 -o "%(title)s"
import { create_promise_scheduler } from "./promise_scheduler.ts";

const textDecoder = new TextDecoder();

export function downloadSongs(songs: string[]) {
    return create_promise_scheduler(
        songs.map((song) => {
            return () => {
                console.log(
                    `Starting download of '\x1b[1;34m${song}\x1b[0m'...`,
                );

                return new Deno.Command("yt-dlp", {
                    args: getDownloadArgs(song),
                    stdout: "piped",
                }).spawn().output().then((result) => {
                    console.log(
                        result.success
                            ? `\x1b[1;32m✔ '\x1b[1;34m${song}\x1b[0m' downloaded successfully`
                            : textDecoder.decode(result.stdout),
                    );
                });
            };
        }),
        4,
    );
}

function getDownloadArgs(song: string) {
    return [
        `ytsearch:"${song}"`,
        "-x",
        "--audio-format",
        "mp3",
        "-o",
        "songs/%(title)s",
    ];
}
