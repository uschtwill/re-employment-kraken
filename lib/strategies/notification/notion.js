export const strategy = {
  notify: async ({ messageItems, options }) => {
    const { notionClient, boardId } = options;
    await _createNotionEntry(messageItems, boardId, notionClient);
  },
};

const _createNotionEntry = async (messageItems, boardId, notionClient) => {
  {
    const { strategy, query, extractedTitle, extractedHref } = messageItems;

    await notionClient.pages.create({
      parent: {
        type: "database_id",
        database_id: boardId,
      },
      properties: {
        Name: {
          type: "title",
          title: [{ type: "text", text: { content: extractedTitle } }],
        },
        Status: {
          type: "status",
          status: {
            name: "Not started",
          },
        },
        Strategy: {
          rich_text: [
            {
              type: "text",
              text: {
                content: strategy.name,
              },
            },
          ],
        },
        Href: {
          url: extractedHref,
        },
        Query: {
          rich_text: [
            {
              type: "text",
              text: {
                content: query,
              },
            },
          ],
        },
      },
    });
  }
};
