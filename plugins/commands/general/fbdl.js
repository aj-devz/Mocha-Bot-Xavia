import axios from 'axios';

const config = {
    name: "alldl",
    aliases: ["alldownload", "linkdownload"],
    description: "Download Video Links in many Platforms",
    usage: "[link]",
    cooldown: 5,
    permissions: [1, 2], // Updated permissions
    isAbsolute: false,
    isHidden: false,
    credits: "coffee",
};

async function fetchContent(BASE_URL, selectedUrlIndex, link) {
    const BASE_URLS = [
        'https://samirxpikachuio.onrender.com',
        'https://www.samirxpikachu.run.place',
        'http://samirxzy.onrender.com'
    ];

    try {
        let response = await axios.get(`${BASE_URLS[selectedUrlIndex]}${BASE_URL}`);
        return response;
    } catch (error) {
        if (selectedUrlIndex < BASE_URLS.length - 1) {
            selectedUrlIndex++;
            return await fetchContent(BASE_URL, selectedUrlIndex, link);
        } else {
            throw new Error("All fallback URLs failed.");
        }
    }
}

/** @type {TOnCallCommand} */
async function onCall({ message, args }) {
    const link = args.join(" ");
    if (!link) {
        return message.reply("Please provide the link.");
    } else {
        let BASE_URL;
        let selectedUrlIndex = 0;

        // Determine the base URL based on the input link
        if (link.includes("facebook.com")) {
            BASE_URL = `/fbdl?vid_url=${encodeURIComponent(link)}`;
        } else if (link.includes("twitter.com")) {
            BASE_URL = `/twitter?url=${encodeURIComponent(link)}`;
        } else if (link.includes("tiktok.com")) {
            BASE_URL = `/tiktok?url=${encodeURIComponent(link)}`;
        } else if (link.includes("open.spotify.com")) {
            BASE_URL = `/spotifydl?url=${encodeURIComponent(link)}`;
        } else if (link.includes("youtu.be") || link.includes("youtube.com")) {
            BASE_URL = `/ytdl?url=${encodeURIComponent(link)}`;
        } else if (link.includes("instagram.com")) {
            BASE_URL = `/igdl?url=${encodeURIComponent(link)}`;
        } else {
            return message.reply("Unsupported source.");
        }

        message.reply("Processing your request... Please wait.");

        try {
            const res = await fetchContent(BASE_URL, selectedUrlIndex, link);
            let contentUrl;

            // Extract the content URL based on the platform
            if (link.includes("facebook.com")) {
                contentUrl = res.data.links["Download High Quality"];
            } else if (link.includes("twitter.com")) {
                contentUrl = res.data.HD;
            } else if (link.includes("tiktok.com")) {
                contentUrl = res.data.hdplay;
            } else if (link.includes("instagram.com")) {
                const instagramResponse = res.data;
                if (Array.isArray(instagramResponse.url) && instagramResponse.url.length > 0) {
                    const mp4UrlObject = instagramResponse.url.find(obj => obj.type === 'mp4');
                    if (mp4UrlObject) {
                        contentUrl = mp4UrlObject.url;
                    }
                }
            }

            const response = {
                attachment: await global.utils.getStreamFromURL(contentUrl),
            };

            await message.reply(response);
        } catch (error) {
            message.reply("Sorry, the content could not be downloaded.");
        }
    }
}

// Exporting the config and command handler as specified
export default {
    config,
    onCall,
};