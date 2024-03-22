import { program } from "commander";
import { postModuleApp, updateProject } from "../app/utils.js";
import chokidar from "chokidar";
import { readdir, stat, readFile } from "fs/promises";

const syncCommand = program
  .command("sync <project>")
  .description("Watch files for changes and upload them")
  .action(async (project) => {
    const projectData = await updateProject(project);

    // Define the directory to watch and the API endpoint to upload to
    const watchDirectory = `./files/${projectData[project].dir_name}`; // Change this to your desired directory

    // Initialize the file watcher
    const watcher = chokidar.watch(watchDirectory, {
      ignoreInitial: true, // Ignore initial scan
    });

    // Sync existing files and directories
    try {
      const files = await readdir(watchDirectory);
      for (const file of files) {
        const filePath = `${watchDirectory}/${file}`;
        const fileStat = await stat(filePath);
        console.log(`Syncing ${fileStat.isFile()}...`);

        if (!fileStat.isFile()) {
          // Handle directory
          // console.log(`Handling directory event (${actionType}): ${dirPath}`);
          await uploadFile({
            file_name: "", // Empty file name for directories
            file_path: "",
            content: "", // Empty content for directories
            directory: filePath, // Directory path
            action_type: "create-dir",
            last_modified: "",
          });
        } else {
          // Handle file
          const fileContent = await readFile(filePath, "utf-8");
          console.log(`Uploading ${filePath}...`);

          // Make a POST request to the API endpoint to create or update the file
          const fileName = basename(filePath);
          const fileDir = dirname(filePath); // Get the directory name

          await uploadFile({
            file_name: fileName,
            file_path: filePath,
            content: fileContent,
            directory: fileDir, // Include directory name in the payload
            action_type: "create",
            last_modified: (await stat(filePath)).mtime,
          });
          console.log(`Uploaded ${filePath} successfully.`);
        }
      }
    } catch (error) {
      console.error(`Failed to sync files. Error: ${error.message}`);
    }

    async function uploadFile(payload) {
      try {
        const response = await postModuleApp(
          projectData[project].dev_url,
          payload,
          projectData[project].access_key
        );
        // console.log(
        //   `Uploaded ${payload.file_path} successfully for ${project}`
        // );
      } catch (error) {
        console.error(`Error uploading file for ${project}:`, error);
      }
    }

    console.log(`Watching directory: ${watchDirectory}`);
  });

export default syncCommand;
