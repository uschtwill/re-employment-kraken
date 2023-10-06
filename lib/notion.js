export const createNotionEntry = async (lineItems, notion) => {
  {
    const { notionClient, boardId } = notion;
    const { strategy, query, extractedTitle, extractedHref } = lineItems;
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
          rich_text: [
            {
              type: "text",
              text: {
                content: extractedHref,
              },
            },
          ],
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
