import { Groq } from "groq-sdk";

async function getEmojiSuggestionFromGroq(title: string) {
  const groq = new Groq({ apiKey: process.env.NUXT_GROQ_API_KEY! });
  const response = await groq.chat.completions.create({
    messages: [
      {
        role: "system",
        content:
          "You are a fun accountant that is specialized in categorizing expenses into relevant emojis.",
      },
      {
        role: "user",
        content:
          "Given the following title (usually given in Japanese) of an expense recorded, determine the most suitable emojis out of pizza, coffee, toilet paper, beer, airplane, shopping cart, party, and money flying away",
      },
      {
        role: "user",
        content: `The title of the expense recorded is "${title}"`,
      },
    ],
    model: "openai/gpt-oss-20b",
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "emoji",
        schema: {
          type: "object",
          properties: {
            category: {
              type: "string",
              enum: ["🍕", "☕️", "🍺", "🧻", "✈️", "🛒", "🎉", "💸"],
            },
          },
        },
      },
    },
  });

  console.log(response.choices[0].message.content);
  return response.choices[0].message.content;
}

export default defineEventHandler(async (event) => {
  const { title }: { title: string } = await readBody(event);
  const emojiJson = await getEmojiSuggestionFromGroq(title);

  const { category } = JSON.parse(emojiJson || '{ "category": "💸" }');
  console.log(category);
  return category;
});
