import { Client, Message, EmbedBuilder } from 'discord.js';

// Handle messages (for @mentions and conversational AI)
export async function handleMessage(client: Client, message: Message) {
  // Ignore bot messages
  if (message.author.bot) return;

  // Check if the bot is mentioned
  const isMentioned = message.mentions.has(client.user!);
  
  // Also respond to messages that start with "lucyn" (case insensitive)
  const startsWithLucyn = message.content.toLowerCase().startsWith('lucyn');

  if (!isMentioned && !startsWithLucyn) return;

  // Extract the actual question/command (remove the mention)
  let content = message.content
    .replace(new RegExp(`<@!?${client.user!.id}>`, 'g'), '')
    .replace(/^lucyn/i, '')
    .trim();

  if (!content) {
    // Just a mention with no content
    await message.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(0x5865f2)
          .setTitle('👋 Hey there!')
          .setDescription(
            "I'm **Lucyn**, your AI Product Engineer!\n\n" +
            "Here's what I can help with:\n" +
            "• Ask me questions about your codebase\n" +
            "• Get insights with `/insights`\n" +
            "• View team activity with `/team`\n" +
            "• Analyze code with `/analyze`\n\n" +
            "Try asking me something like:\n" +
            '> _"What\'s the status of open PRs?"_\n' +
            '> _"How is the team doing this week?"_'
          )
          .setFooter({ text: 'Type /help for all commands' })
      ],
    });
    return;
  }

  // Show typing indicator
  await message.channel.sendTyping();

  try {
    // Process the question and generate a response
    const response = await processQuestion(content);
    
    await message.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(0x5865f2)
          .setDescription(response)
          .setFooter({ text: 'Lucyn AI • Ask me anything!' })
          .setTimestamp()
      ],
    });
  } catch (error) {
    console.error('Error processing message:', error);
    await message.reply({
      content: '❌ Sorry, I encountered an error processing your request. Please try again!',
    });
  }
}

// Process natural language questions
async function processQuestion(question: string): Promise<string> {
  const lowerQuestion = question.toLowerCase();

  // Simple pattern matching for common questions
  // In production, this would use the AI package for real NLP
  
  if (lowerQuestion.includes('pr') || lowerQuestion.includes('pull request')) {
    return (
      "📊 **Pull Request Status**\n\n" +
      "Here's the current PR overview:\n" +
      "• **5** PRs open and awaiting review\n" +
      "• **3** PRs approved and ready to merge\n" +
      "• **2** PRs with requested changes\n\n" +
      "⚠️ **Needs Attention:**\n" +
      "• PR #234 has been waiting for review for 5 days\n" +
      "• PR #228 has merge conflicts\n\n" +
      "_Use `/insights` for more detailed metrics!_"
    );
  }

  if (lowerQuestion.includes('team') || lowerQuestion.includes('how is everyone')) {
    return (
      "👥 **Team Status**\n\n" +
      "Your team is doing great this week! Here's a summary:\n\n" +
      "🟢 **5/5 team members** active today\n" +
      "📝 **47 commits** pushed this week\n" +
      "🔀 **9 PRs** merged successfully\n" +
      "⏱️ Average review time: **4.2 hours**\n\n" +
      "🌟 **Top contributor:** Alice Chen (15 commits)\n\n" +
      "_Use `/team` for individual breakdowns!_"
    );
  }

  if (lowerQuestion.includes('commit') || lowerQuestion.includes('change')) {
    return (
      "📝 **Recent Commits**\n\n" +
      "Here are the latest commits:\n\n" +
      "• `abc1234` - Add user authentication middleware\n" +
      "• `def5678` - Fix session timeout issue\n" +
      "• `ghi9012` - Update dependencies\n" +
      "• `jkl3456` - Add unit tests for auth module\n" +
      "• `mno7890` - Refactor user profile component\n\n" +
      "_Use `/analyze commit:SHA` to analyze a specific commit!_"
    );
  }

  if (lowerQuestion.includes('help') || lowerQuestion.includes('what can you do')) {
    return (
      "🤖 **Here's what I can help with:**\n\n" +
      "**Commands:**\n" +
      "• `/insights` - Team health and AI recommendations\n" +
      "• `/team` - Individual contributor metrics\n" +
      "• `/repos` - Repository status overview\n" +
      "• `/analyze` - Code quality analysis\n\n" +
      "**Just ask me:**\n" +
      "• About PRs, commits, or team activity\n" +
      "• For code review suggestions\n" +
      "• About project health and risks\n\n" +
      "I'll notify you automatically about important events! 🔔"
    );
  }

  if (lowerQuestion.includes('health') || lowerQuestion.includes('status') || lowerQuestion.includes('how are we doing')) {
    return (
      "📊 **Project Health Overview**\n\n" +
      "🟢 **Health Score: 82/100** - Looking good!\n\n" +
      "**Strengths:**\n" +
      "✅ Fast PR review times (avg 4.2 hours)\n" +
      "✅ Consistent commit activity\n" +
      "✅ Good test coverage (78%)\n\n" +
      "**Areas to Watch:**\n" +
      "⚠️ 2 stale PRs need attention\n" +
      "⚠️ Auth module has high code churn\n\n" +
      "_Use `/insights` for detailed recommendations!_"
    );
  }

  // Default response for unknown questions
  return (
    "🤔 I'm not sure I understood that completely, but here's what I can help with:\n\n" +
    "• **PR status** - Ask about pull requests\n" +
    "• **Team activity** - How the team is doing\n" +
    "• **Project health** - Overall project status\n" +
    "• **Recent commits** - What's changed recently\n\n" +
    "Try asking something like:\n" +
    '> _"What\'s the status of our PRs?"_\n' +
    '> _"How is the team doing?"_\n\n' +
    "Or use `/help` to see all available commands!"
  );
}
