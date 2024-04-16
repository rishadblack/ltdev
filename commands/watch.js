import { program } from "commander";
import {
  postModuleApp,
  updateProject,
  handleErrorMessage,
} from "../app/utils.js";
import chokidar from "chokidar";
import { readFile, stat } from "fs/promises";
import { basename, dirname } from "path"; // Import dirname function to get the directory name

const watchCommand = program
  .command("watch <project>")
  .description(
    "Watch projects for changes and upload them for a specific project"
  )
  .action(async (project) => {
    const projectData = await updateProject(project);
    const watchDirectory = `./projects/${projectData[project].dir_name}`; // Set the directory based on the project name

    const watcher = chokidar.watch(watchDirectory, {
      ignoreInitial: true,
    });

    watcher.on("ready", () => {
      console.log(
        `Watching directory for ${projectData[project].name}: ${watchDirectory}`
      );
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
    });

    watcher.on("addDir", async (dirPath) => {
      await handleDirectoryEvent(dirPath, "create-dir");
      console.log(`Directory ${dirPath} has been created.`);
    });

    watcher.on("unlinkDir", async (dirPath) => {
      await handleDirectoryEvent(dirPath, "delete-dir");
      console.log(`Directory ${dirPath} has been removed.`);
    });

    async function handleFileEvent(filePath, actionType) {
      try {
        const fileContent = await readFile(filePath, "utf-8");
        const fileName = basename(filePath);
        const fileDir = dirname(filePath); // Get the directory name
        const fileContentBase64 = Buffer.from(fileContent).toString("base64");

        await uploadFile({
          file_name: fileName,
          file_path: filePath,
          content: fileContentBase64,
          directory: fileDir, // Include directory name in the payload
          action_type: actionType,
          last_modified: (await stat(filePath)).mtime,
        });
      } catch (error) {
        handleErrorMessage(error);
      }
    }

    async function handleDirectoryEvent(dirPath, actionType) {
      try {
        await uploadFile({
          file_name: "", // Empty file name for directories
          file_path: "",
          content: "", // Empty content for directories
          directory: dirPath, // Empty directory name for directories
          action_type: actionType,
          last_modified: "",
        });

        console.log(`Handled directory event (${actionType}): ${dirPath}`);
      } catch (error) {
        handleErrorMessage(error);
      }
    }

    async function uploadFile(payload) {
      try {
        const response = await postModuleApp(
          `${projectData[project].dev_url}/api/v1/watch/${project}`,
          payload,
          projectData[project].access_key
        );
        // console.log(
        //   `Uploaded ${payload.file_path} successfully for ${project}`
        // );
      } catch (error) {
        handleErrorMessage(error);
      }
    }

    // console.log(`Watching directory: ${watchDirectory}`);
  });

export default watchCommand;
