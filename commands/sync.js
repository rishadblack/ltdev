import { program } from "commander";
import axios from "axios";
import chokidar from "chokidar";
import { readdir, stat, readFile } from "fs/promises";

const syncCommand = program
  .command("sync")
  .description("Watch files for changes and upload them")
  .action(async () => {
    // Define the directory to watch and the API endpoint to upload to
    const watchDirectory = "./files"; // Change this to your desired directory
    const uploadEndpoint = "http://example-moduler.local/api/v1/watch"; // Change this to your API's upload endpoint

    // Initialize the file watcher
    const watcher = chokidar.watch(watchDirectory, {
      ignoreInitial: true, // Ignore initial scan
    });

    // Sync existing files
    try {
      const files = await readdir(watchDirectory);
      for (const file of files) {
        const filePath = `${watchDirectory}/${file}`;
        const fileStat = await stat(filePath);
        const fileContent = await readFile(filePath, "utf-8");
        console.log(`Uploading ${filePath}...`);

        // Make a POST request to the API endpoint to create or update the file
        await axios.post(uploadEndpoint, {
          file_name: filePath.split("/").pop(),
          file_path: filePath,
          last_modified: fileStat.mtime,
          content: fileContent,
        });
        console.log(`Uploaded ${filePath} successfully.`);
      }
    } catch (error) {
      console.error(`Failed to sync files. Error: ${error.message}`);
    }

    console.log(`Watching directory: ${watchDirectory}`);
  });

export default syncCommand;
