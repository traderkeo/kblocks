const { program } = require('commander');
const fs = require('fs');
const path = require('path');
const axios = require('axios'); // for HTTP requests

program
  .command('add <component>')
  .description('Add a specific component to your project')
  .action((component) => {
    // Create a directory path for the component
    const componentDirPath = path.join(process.cwd(), 'components', component);
    
    // Check if the directory exists, if not, create it
    if (!fs.existsSync(componentDirPath)){
      fs.mkdirSync(componentDirPath, { recursive: true });
    }

    // Set the path for the component file (index.tsx)
    const componentFilePath = path.join(componentDirPath, 'index.tsx');
    
    // URL to download the component from your GitHub repository
    const componentUrl = `https://raw.githubusercontent.com/traderkeo/kblocks/master/src/components/${component}/index.tsx`;
    
    // Download the component
    downloadComponent(componentUrl, componentFilePath);
  });

program.parse(process.argv);

function downloadComponent(url, filePath) {
  axios({
    method: 'get',
    url: url,
    responseType: 'stream'
  })
  .then(function (response) {
    response.data.pipe(fs.createWriteStream(filePath));
  })
  .catch(function (error) {
    console.error('Error downloading the component:', error);
  });
}
