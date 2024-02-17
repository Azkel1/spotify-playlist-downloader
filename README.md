# Spotify Playlist Downloader
This a CLI app to donwload your Spotify playlists to .mp3 files.

> [!NOTE]  
> The project is very barebones and has many unhandled edge cases, if you find something wrong submit an issue and I may check it when I have some free time.

## Usage
1. Download and install the latest version of [Deno](https://docs.deno.com/runtime/manual)
2. Download and install the latest version of [yt-dlp](https://github.com/yt-dlp/yt-dlp/releases/latest)
3. Download and install the latest version of [ffmpeg](https://ffmpeg.org/download.html)
4. Clone the repo locally
5. Create a copy of the `config.example.json` file and rename it to `config.json`
6. Fill the fields in the `config.json` file with your Spotify API credentials
7. Run `deno task start`

## Improvements

- [ ] Make the downloader display a message when a song has finished downloading or when an error occurs
- [ ] Improve CLI experience (help command, improved error messages, etc)
- [ ] Keep log of already downloaded songs to avoid redownloading them
