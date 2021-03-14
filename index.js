const Discord = require("discord.js");
const client = new Discord.Client();
const fs = require("fs");
const db = require("quick.db");
const config = require("./config.json");
const prefix = config.prefix

client.on("ready", () => {
  console.log(`Bot gestartet!`);
});

client.on("message", async message => {
  if (message.author.bot) return;
  if (!message.content.startsWith(prefix)) return;
  const args = message.content
    .slice(prefix.length)
    .trim()
    .split(/ +/g);
  const command = args.shift().toLowerCase();

  //g!invite <Link>
  if (command === "invite") {
    if (!message.author.id === config.ownerid) return message.channel.send(`Nur **${config.ownername}** kann diesen Command nutzen!`);
    db.set(`i_${message.guild.id}`, `${args}`);
    message.channel.send(`**Invitelink** auf ||${args}|| gesetzt`);
  }

  //g!cb <CB>
  if (command === "cb") {
    if (args <= 25) {
      var cbconfig = args
      if (cbconfig == 23) {
        var cbconfig = " Nature";
      } else if (cbconfig == 24) {
        var cbconfig = " Extreme";
      } else if (cbconfig == 25) {
        var cbconfig = " Evil";
      }
      db.set(`cb_${message.author.id}`, `${cbconfig}`);
      message.channel.send(`**MainCB** auf **CB${cbconfig}** gesetzt`);
    } else {
      message.reply("Bitte gebe eine **Zahl** zwischen zwischen **1 und 25** an. Für mehr Informationen nutze **g!help**!");
      db.set(`cb_${message.author.id}`, null);
    }
  }

  //usage g!global <#channel>
  if (command === "global") {
    const channel = message.mentions.channels.first();
    if (!message.member.hasPermission(`ADMINISTRATOR`)) return message.channel.send(`Dazu benötigst du folgende Berechtigung: **ADMINISTRATOR**!`);
    if (db.fetch(`g_${message.guild.id}`) === null) {
      if (!channel) return message.channel.send("**Üngültiger Kanal**, bitte gebe einen gültigen an! Für eine Erklärung nutze **g!help**");

      db.set(`g_${message.guild.id}`, `${channel.id}`);
      message.channel.send(`**Globalchat** wurde für ${channel} definiert!`);
    } else {
      db.set(`g_${message.guild.id}`, null);
      message.reply(`**Globalchat** wurde enfernt!`);
    }
  }

  //usage g!help
  if (command === "help") {
    const helpembed = new Discord.MessageEmbed()
      .setTitle("Help")
      .setDescription("Dieser Bot verbindet Channel Weltweit über mehrer Server hinweg miteinander. Zur Einrichtung folge den unteren Hinweisen.")
      .addField("g!cb <cb>, g!cb", "Definiere einen MainCB. Bei dem CB-Command ist zu beachten, dass Nature = 23, Extreme = 24 und Evil = 25 gilt. Wenn kein gültiger CB angegeben wird resettet dieser sich.")
      .addField("g!global <#Channelname>, g!global", "Definiere einen Globalchannel mit dem vorderen Command, mit dem hinteren kannst du diesen deaktivieren.")
      .setTimestamp()
      .setFooter("GG-Globalbot by Tigerbyte")
    message.channel.send(helpembed)
  }
});

client.on("message", async message => {
  if (message.content.startsWith(`${prefix}`)) return message.delete();

  const channelID = db.fetch(`g_${message.guild.id}`);
  var invite = db.fetch(`i_${message.guild.id}`);
  var cb = db.fetch(`cb_${message.author.id}`);

  if (cb === null) {
    var cb = "Undefiniert - g!cb <Nummer>";
  } else {
    var cb = "CB" + db.fetch(`cb_${message.author.id}`);
  }

  if (invite === null) {
    var invite = "";
  } else {
    var invite = "• [Serverinvite](" + db.fetch(`i_${message.guild.id}`) + ")";
  }

  if (message.author.id === config.ownerid) {
    var tag = `Owner`;
    var color = `#CD3333`;
  } else {
    var tag = `User`;
    var color = `#D3D3D3`;
  }

  if (message.channel.id === channelID) {
    //Banlist User
    if (message.author.id === "159985870458322944") return message.delete(); // Mee6
    if (message.author.id === "235088799074484224") return message.delete();// Rythm
    if (message.author.id === "696120322705064036") return message.delete(); // BestBot

    if (message.author.bot) return;
    message.delete();

    //Banlist Wörter
    if (message.content.startsWith("!")) return;
    if (message.content.startsWith("#")) return;
    if (message.content.startsWith("$")) return;
    if (message.content.startsWith("gif -")) return;
    if (message.content.startsWith("c!")) return;
    if (message.content.startsWith("h!")) return;
    if (message.content.startsWith("https://")) return message.reply("Bitte sende keine Links!");

    const embed = new Discord.MessageEmbed()
      .setColor(color)
      .setThumbnail(`${message.author.avatarURL()}`)
      .setTitle(`${tag} | ${message.author.tag}`)
      .addField(`\u200B`, message.content)
      .addField(`${cb}`, `[Support](${config.supportlink}) • [Botinvite](${config.botinvite}) ${invite}`)
      .setFooter(`${message.guild.name} hat ${message.guild.memberCount} Member`)
      .setTimestamp()

    client.guilds.cache.forEach(g => {
      try {
        client.channels.cache.get(db.fetch(`g_${g.id}`)).send(embed);
      } catch (e) {
        return;
      }
    });
  }
});

client.login(config.token);