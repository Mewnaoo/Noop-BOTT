const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { 
  createSetupEmbed, 
  createSetupButtons, 
  createErrorEmbed, 
  createInfoEmbed, 
  createWarningEmbed 
} = require('../utils/embeds');
const { verifySetup, cleanupInvalidSetup } = require('../utils/setupHandler');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setup')
    .setDescription('ตั้งค่าระบบสร้างห้องอัตโนมัติ')
    .addStringOption(option =>
      option.setName('interface')
        .setDescription('รูปแบบตั้งค่ห้อง')
        .setRequired(false)
        .addChoices(
          { name: 'ต้นฉบับ', value: 'original' },
          { name: 'มาตรฐาน', value: 'standard' }
        )
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  
  async execute(interaction) {
    // Check if user has administrator permissions
    if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
      return interaction.reply({
        embeds: [createErrorEmbed(
          'ไม่ได้รับอนุญาต', 
          'คุณต้องมีสิทธิ์ผู้ดูแลระบบจึงจะสามารถใช้คำสั่งนี้ได้.'
        )],
        ephemeral: true
      });
    }

    await interaction.deferReply({ ephemeral: true });

    // Verify if setup is still valid
    const setupStatus = await verifySetup(interaction.guild);
    
    if (setupStatus.valid) {
      return interaction.editReply({
        embeds: [createInfoEmbed(
          'ตั้งค่าเรียบร้อยแล้ว', 
          'Noop ได้ถูกตั้งค่าไว้ในเซิร์ฟเวอร์นี้เรียบร้อยแล้ว.',
          [
            { 
              name: 'Current Setup', 
              value: `Category: <#${setupStatus.settings.categoryId}>\nCreator Channel: <#${setupStatus.settings.creatorChannelId}>\nInterface Channel: <#${setupStatus.settings.interfaceChannelId}>`, 
              inline: false 
            }
          ]
        )],
        ephemeral: true
      });
    } else {
      // If setup is invalid, clean it up
      if (setupStatus.reason !== 'No settings found') {
        await cleanupInvalidSetup(interaction.guild);
        await interaction.editReply({
          embeds: [createWarningEmbed(
            'การตั้งค่าที่ไม่ถูกต้องถูกล้างออกแล้ว', 
            `การตั้งค่าก่อนหน้านี้ไม่ถูกต้อง (${setupStatus.reason}). ระบบได้ทำการล้างข้อมูลเรียบร้อยแล้ว โปรดเรียกใช้คำสั่งอีกครั้งเพื่อตั้งค่า Noop.`
          )],
          ephemeral: true
        });
        return;
      }
    }

    const interfaceType = interaction.options.getString('interface') || 'standard';
    const setupEmbed = createSetupEmbed(interfaceType);
    const setupButtons = createSetupButtons();

    await interaction.editReply({
      embeds: [setupEmbed],
      components: [setupButtons],
      ephemeral: false
    });
  }
}; 
