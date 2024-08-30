// yt-dlp.exe ytsearch:"<song name>" -x --audio-format mp3 -o "%(title)s"

const textDecoder = new TextDecoder();

export function downloadSongs(songs: string[]) {
    return Promise.all(songs.map(async (song) => {
        console.log("Starting download of:", `${song}...`);

        const result = await new Deno.Command("yt-dlp", {
            args: getDownloadArgs(song),
            stdout: "piped",
        }).spawn().output();

        console.log(
            result.success
                ? `'${song}' downloaded successfully`
                : textDecoder.decode(result.stdout),
        );
    }));
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
