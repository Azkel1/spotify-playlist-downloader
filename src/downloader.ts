// yt-dlp.exe ytsearch:"<song name>" -x --audio-format mp3 -o "%(title)s"
import { config } from "./config.ts";
import { create_promise_scheduler } from "./promise_scheduler.ts";
import type { SpotifySong } from "./schemas.ts";

const textDecoder = new TextDecoder();

export function downloadSongs(songs: Array<SpotifySong>) {
    return create_promise_scheduler(
        songs.map((song) => {
            return () => {
                console.log(
                    `Starting download of '\x1b[1;34m${song.name}\x1b[0m'...`,
                );

                return new Deno.Command("yt-dlp", {
                    args: getDownloadArgs(song.name),
                    stdout: "piped",
                }).spawn().output().then(async (result) => {
                    if (result.success) {
                        console.log(
                            `\x1b[1;32m✔ '\x1b[1;34m${song.name}\x1b[0m' downloaded successfully`,
                        );
                        await Deno.writeTextFile(
                            `${config.output_dir}/download.log`,
                            `${song.id}\n`,
                            { append: true, create: true },
                        );
                    } else {
                        console.error(textDecoder.decode(result.stdout));
                    }
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
        `${config.output_dir}/%(title)s`,
    ];
}
