<template>
  <div class="onedrive">
    <div id="container-chooser">
      <button @click="launchPicker">Choose from OneDrive</button>
    </div>
    <form enctype="multipart/form-data" action="http://localhost/dropbox/get.php" method="post">
      <h3>Form Upload example</h3><br>
      <input type="file" name="dropbox_file"><br>
      <button type="submit">Submit</button>
    </form>
  </div>
</template>
<script>

import { config } from '@/config'

export default {
  name: 'OneDriveChooser',
  beforeMount() {
    const scriptEl2 = document.createElement('script');
    scriptEl2.setAttribute('id', `onedrive`);
    scriptEl2.setAttribute('src','https://js.live.net/v7.2/OneDrive.js');
    document.body.appendChild(scriptEl2);
  },
  methods: {
    launchPicker() {
      const odOptions = {
        clientId: config.onedrive_id,
        action: "download",
        multiSelect: false,
         advanced: {
            redirectUri: "http://localhost:8080/redirect"
          },
        success: this.onPickFile,
        cancel: function() { /* cancel handler */ },
        error: function(error) { /* error handler */ }
      };
      OneDrive.open(odOptions)
    },
    onPickFile(files) {
      const file = files.value[0]
      console.log(file)
      if (file.hasOwnProperty('@microsoft.graph.downloadUrl')) {
        this.downloadFile(file, (e) => console.log(e))
      }
    },
    downloadFile(file, callback) {
      this.isDisabled = true
      console.log('downloading file.......')
      const fileInput = document.querySelector('input[type="file"]')
      if (file) {
        console.log('send request.......')
        var xhr = new XMLHttpRequest()
        xhr.open('GET', file['@microsoft.graph.downloadUrl'])
        xhr.responseType = "blob"
        xhr.onload = function() {
          this.isDisabled = false
          const blob = xhr.response
          const myFile = new File([blob], file.name)

          const dataTransfer = new DataTransfer()
          dataTransfer.items.add(myFile)
          fileInput.files = dataTransfer.files
          callback('success....');
        };
        xhr.onerror = function() {
          callback(null)
        };
        xhr.send();
      } else {
        callback(null)
      }
    }
  }
}
</script>
