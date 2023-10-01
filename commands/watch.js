import { program } from "commander";
import axios from "axios";
import chokidar from "chokidar";
import { readFile } from "fs/promises";

const watchCommand = program
  .command("watch")
  .description("Watch files for changes and upload them")
  .action(async () => {
    // Define the directory to watch and the API endpoint to upload to
    const watchDirectory = "./files"; // Change this to your desired directory
    const uploadEndpoint = "https://xyz.com/api/upload"; // Change this to your API's upload endpoint

    // Initialize the file watcher
    const watcher = chokidar.watch(watchDirectory, {
      ignoreInitial: true, // Ignore initial scan
    });

    // Listen for file changes
    watcher.on("change", async (filePath) => {
      try {
        // Read the stored authentication token
        const token = await readFile("auth-token.txt", "utf-8");

        // Read the changed file
        const fileContent = await readFile(filePath, "utf-8");
        console.log(`Uploading ${filePath}...`);
        console.log(`Token ${token}...`);
        console.log(`Content ${fileContent}...`);
        // Make an authenticated POST request to upload the file
        // const response = await axios.post(uploadEndpoint, fileContent, {
        //   headers: {
        //     Authorization: `Bearer ${token}`,
        //   },
        // });

        // if (response.status === 200) {
        //   console.log(`Uploaded ${filePath} successfully.`);
        // } else {
        //   console.error(
        //     `Upload of ${filePath} failed. Invalid response from the server.`
        //   );
        // }
      } catch (error) {
        console.error(`Upload of ${filePath} failed. Error: ${error.message}`);
      }
    });

    console.log(`Watching directory: ${watchDirectory}`);
  });

export default watchCommand;
