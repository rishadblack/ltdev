// commands/download.js
import "dotenv/config";
import { program } from "commander";
import {
  postModuleApp,
  updateProject,
  getAllFiles,
  postModuleAppDownload,
} from "../app/utils.js";
import inquirer from "inquirer";
import { writeFile, mkdir } from "fs/promises";
import { join, basename, dirname } from "path";

const passCommand = program
  .command("command <project> <module>")
  .description("Pass command to server")
  .action(async (project, module) => {
    const projectData = await updateProject(project);

    try {
      const credentials = await inquirer.prompt([
        {
          type: "input",
          name: "command",
          message: "Enter command to run:",
        },
      ]);

      const response = await runCommand({
        command: credentials.command,
        module: module,
      });

      // Check if the request was successful and save the JSON data to a file
      if (response) {
        if (credentials.command.includes("artisan make")) {
          // Define the directory to watch and the API endpoint to upload to
          const watchDirectory = `./projects/${projectData[project].dir_name}/${projectData[project]["modules"][module].dir_name}`; // Change this to your desired directory

          const getManifestFiles = await manifestFile({
            module: module,
          });

          const watchDirectoryFiles = await getAllFiles(watchDirectory);

          // Check if getManifestFiles contains data
          if (getManifestFiles["file_manifest"].length > 0) {
            // Iterate over each file in the manifest
            for (const manifestFile of getManifestFiles["file_manifest"]) {
              const location = "projects\\" + manifestFile["location"];

              // Check if the file's location exists in the watch directory
              if (!watchDirectoryFiles.includes(location)) {
                const response = await downloadFile({
                  directory: location, // Include directory name in the payload
                });
                const fileData = Buffer.from(response.content, "base64");

                // Ensure that the directory structure leading up to the file exists
                await mkdir(dirname(location), { recursive: true });

                // Write the file to the local filesystem
                await writeFile(location, fileData);
              }
            }
          }
        }
        console.log(response.output);
      } else {
        console.error("Error running command.");
      }
    } catch (error) {
      console.error(error.message);
    }

    async function runCommand(payload) {
      try {
        const response = await postModuleApp(
          `${projectData[project].dev_url}/command/${project}`,
          payload,
          projectData[project].access_key
        );

        if (response.data && response.status === "success") {
          return response.data;
        } else {
          console.error(`${response.message}`);
        }
      } catch (error) {
        console.error(`Error uploading file for ${project}:`, error);
      }
    }

    async function manifestFile(payload) {
      try {
        const response = await postModuleApp(
          `${projectData[project].dev_url}/manifest/${project}`,
          payload,
          projectData[project].access_key
        );

        if (response.data && response.status === "success") {
          return response.data;
        } else {
          console.error(`${response.message}`);
        }
      } catch (error) {
        console.error(`Error uploading file for ${project}:`, error);
      }
    }

    async function downloadFile(payload) {
      try {
        const response = await postModuleAppDownload(
          `${projectData[project].dev_url}/download/${project}`,
          payload,
          projectData[project].access_key
        );
        const responseFile = JSON.parse(new TextDecoder().decode(response));

        if (responseFile.data && responseFile.status === "success") {
          return responseFile.data;
        } else {
          console.error(`${response.message}`);
        }
      } catch (error) {
        console.error(`Error uploading file for ${project}:`, error);
      }
    }
  });

// Export passCommand as the default export
export default passCommand;
