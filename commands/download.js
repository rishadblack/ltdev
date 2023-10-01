// commands/download.js

import { program } from "commander";
import axios from "axios";
import { readFile, writeFile } from "fs/promises";

const downloadCommand = program
  .command("pull")
  .description("Download a JSON file from the API")
  .action(async () => {
    try {
      // Read the stored authentication token
      const token = await readFile("auth-token.txt", "utf-8");
      console.log(token);
      // Make an authenticated GET request to the JSON file endpoint
      //   const response = await axios.get("https://xyz.com/api/file.json", {
      //     headers: {
      //       Authorization: `Bearer ${token}`,
      //     },
      //   });

      //   // Check if the request was successful and save the JSON data to a file
      //   if (response.status === 200 && response.data) {
      //     await writeFile(
      //       "downloaded-file.json",
      //       JSON.stringify(response.data, null, 2)
      //     );
      //     console.log("Downloaded JSON file successfully.");
      //   } else {
      //     console.error("Download failed. Invalid response from the server.");
      //   }
    } catch (error) {
      console.error("Download failed. Error:", error.message);
    }
  });

// Export downloadCommand as the default export
export default downloadCommand;
