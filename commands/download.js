// commands/download.js
import "dotenv/config";
import { program } from "commander";
import { postWithToken } from "../app/utils.js";

const downloadCommand = program
  .command("pull")
  .description("Download a JSON file from the API")
  .action(async () => {
    try {
      const response = await postWithToken("v1/user");

      // Check if the request was successful and save the JSON data to a file
      if (response && response.status === "success") {
        console.log("Downloaded JSON file successfully.");
      } else {
        console.error("Download failed. Invalid response from the server.");
      }
    } catch (error) {
      console.error("Download failed. Error:", error.message);
    }
  });

// Export downloadCommand as the default export
export default downloadCommand;
