import fetch from 'node-fetch'

export async function before(m, { conn }) {
//let img = await (await fetch(`https://tinyurl.com/2c5hk765`)).buffer()
let img = catalogo
 global.fake = {
    contextInfo: {
    	isForwarded: true,
    forwardedNewsletterMessageInfo: {
      newsletterJid: "120363422161687949@newsletter",
      serverMessageId: 100,
      newsletterName: '𝑺𝒉𝒂𝒅𝒐𝒘 𝑩𝒐𝒕 🍷',
    },
	    externalAdReply: {
				    showAdAttribution: true,
					title: botname,
					body: 'Hola',
					mediaUrl: null,
					description: null,
					previewType: "PHOTO",
					thumbnailUrl: 'https://i.ibb.co/4jft6vs/file.jpg',
		           sourceUrl: canal,
		           mediaType: 1,
                   renderLargerThumbnail: false
	    },
    },
  }

 global.adReply = {
	    contextInfo: { 
             forwardingScore: 9999, 
                 isForwarded: false, 
                    externalAdReply: {
				    showAdAttribution: true,
					title: botname,
					body: textbot,
					mediaUrl: null,
					description: null,
					previewType: "PHOTO",
					thumbnailUrl: img,
                    thumbnail: img,
		           sourceUrl: canal,
		           mediaType: 1,
                   renderLargerThumbnail: true
				}
			}
		}

global.rcanal = {
contextInfo: {
isForwarded: true,
forwardedNewsletterMessageInfo: {
newsletterJid: "120363422161687949@newsletter",
serverMessageId: 100,
newsletterName: '𝑺𝒉𝒂𝒅𝒐𝒘 𝑩𝒐𝒕 🍷',
},
externalAdReply: { 
showAdAttribution: true,
title: '𝑺𝑯𝑨𝑫𝑶𝑾 - 𝑩𝑶𝑻',
body: '𝑪𝒓𝒊𝒔𝒕𝒊𝒂𝒏 𝒅𝒐 𝒎𝒆𝒋𝒐𝒓 🍷',
previewType: "PHOTO",
thumbnailUrl: 'https://i.ibb.co/4jft6vs/file.jpg',
sourceUrl: 'https://www.instagram.com/josssi_bot.ff',
mediaType: 1,
renderLargerThumbnail: false
},},}
	
}
