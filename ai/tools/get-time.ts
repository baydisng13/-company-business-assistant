import { tool } from "ai";
import axios from "axios";
import { z } from "zod";

export const getServerTimeTool = tool({
  description: "Get the current server date and time",
  parameters: z.object({}),
  execute: async () => {
    const now = new Date();
    return {
      datetime: now.toISOString()
    };
  }
});


export const getTimeInZoneTool = tool({
  description: "Get current date/time in a specified timezone",
  parameters: z.object({
    timezone: z.string().describe('Time zone like "Europe/Paris"')
  }),
  execute: async ({ timezone }) => {
    const resp = await axios.get(`http://worldtimeapi.org/api/timezone/${timezone}`);
    const { datetime, utc_offset } = resp.data;
    return { datetime, utc_offset, timezone };
  }
});
