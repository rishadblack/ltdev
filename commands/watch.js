import { program } from "commander";
import axios from "axios";
import chokidar from "chokidar";
import { readFile, stat } from "fs/promises";
import { basename, dirname } from "path"; // Import dirname function to get the directory name

const watchCommand = program
  .command("watch")
  .description("Watch files for changes and upload them")
  .action(async () => {
    const watchDirectory = "./files";
    const uploadEndpoint = "http://example-moduler.local/api/v1/watch";

    const watcher = chokidar.watch(watchDirectory, {
      ignoreInitial: true,
    });

    watcher.on("ready", () => {
      console.log("Initial scan complete. Watching for changes...");
    });

    watcher.on("add", async (filePath) => {
      await handleFileEvent(filePath, "create");
      console.log(`File ${filePath} has been added.`);
    });

    watcher.on("change", async (filePath) => {
      await handleFileEvent(filePath, "update");
      console.log(`File ${filePath} has been changed.`);
    });

    watcher.on("unlink", async (filePath) => {
      await handleDirectoryEvent(filePath, "delete");
      console.log(`File ${filePath} has been removed.`);
      // Handle file removal as needed
    });

    watcher.on("addDir", async (dirPath) => {
      await handleDirectoryEvent(dirPath, "create-dir");
      console.log(`Directory ${dirPath} has been created.`);
      // Handle directory creation as needed
    });

    watcher.on("unlinkDir", async (dirPath) => {
      await handleDirectoryEvent(dirPath, "delete-dir");
      console.log(`Directory ${dirPath} has been removed.`);
      // Handle directory removal as needed
    });

    watcher.on("move", async (oldPath, newPath) => {
      await handleFileEvent(newPath, "move");
      console.log(`File ${oldPath} has been moved to ${newPath}.`);
      // Handle file movement as needed
    });

    async function handleFileEvent(filePath, actionType) {
      try {
        const fileContent = await readFile(filePath, "utf-8");
        console.log(`Uploading ${filePath}...`);

        const fileName = basename(filePath);
        const fileDir = dirname(filePath); // Get the directory name

        await uploadFile({
          file_name: fileName,
          file_path: filePath,
          content: fileContent,
          directory: fileDir, // Include directory name in the payload
          action_type: actionType,
        });

        console.log(`Uploaded ${filePath} successfully.`);
      } catch (error) {
        console.error(`Upload of ${filePath} failed. Error: ${error}`);
      }
    }

    async function handleDirectoryEvent(dirPath, actionType) {
      try {
        await uploadFile({
          file_name: "", // Empty file name for directories
          file_path: dirPath,
          content: "", // Empty content for directories
          directory: "", // Empty directory name for directories
          action_type: actionType,
        });

        console.log(`Handled directory event (${actionType}): ${dirPath}`);
      } catch (error) {
        console.error(
          `Directory event (${actionType}) failed. Error: ${error}`
        );
      }
    }

    async function uploadFile(payload) {
      console.log(payload);
      return;
      try {
        const response = await axios.post(uploadEndpoint, payload);

        if (response.status !== 200) {
          throw new Error("Invalid response from the server.");
        }
      } catch (error) {
        throw new Error(`Upload failed. Error: ${error}`);
      }
    }

    console.log(`Watching directory: ${watchDirectory}`);
  });

export default watchCommand;
