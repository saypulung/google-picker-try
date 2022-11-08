<template>
  <div class="dropbox-chooser">
    <div id="container-chooser">
    </div>
    <form enctype="multipart/form-data" action="http://localhost/dropbox/get.php" method="post">
      <h3>Form Upload example</h3><br>
      <input type="file" name="dropbox_file"><br>
      <button type="submit">Submit</button>
    </form>
  </div>
</template>
<script>
export default {
  name:'DropboxChooser',
  data: () => ({

  }),
  beforeMount() {
    const scriptEl2 = document.createElement('script');
    scriptEl2.setAttribute('id', `dropboxjs`);
    scriptEl2.setAttribute('data-app-key', `v4tjlv6a7a0574h`);
    scriptEl2.setAttribute('src','https://www.dropbox.com/static/api/2/dropins.js');
    scriptEl2.setAttribute('async', true);
    scriptEl2.setAttribute('defer', true);

    document.body.appendChild(scriptEl2);
  },
  mounted() {
    setTimeout(() => {
      const successGet = this.downloadFile;
      const options = {
		    success: function(files) {
		        console.log(files);
		        successGet(files[0], () => {

            });
		    },
		    cancel: function() {

		    },
		    linkType: "direct",
		    multiselect: false,
		    extensions: ['.pdf', '.doc', '.docx', '.mp4', '.apk', '.xlsx'],
		    folderselect: false,
      };
      const mimetypes = {
        pdf: 'application/pdf',
        doc: 'application/msword',
        docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        mp4: 'video/mp4',
        apk: 'application/octet-stream',
        xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      };
      var button = Dropbox.createChooseButton(options);
      document.getElementById("container-chooser").appendChild(button);
      Dropbox.choose(options);
    }, 1000);
  },
  beforeDestroy() {

  },
  methods: {
    downloadFile(file, callback) {
      console.log('downloading file.......');
      const fileInput = document.querySelector('input[type="file"]');
      if (!file.isDir) {
        console.log('send request.......');
        var xhr = new XMLHttpRequest();
        xhr.open('GET', file.link);
        xhr.responseType = "blob";
        xhr.onload = function() {
          const blob = xhr.response;
          const myFile = new File([blob], file.name);

          const dataTransfer = new DataTransfer();
          dataTransfer.items.add(myFile);
          fileInput.files = dataTransfer.files;
          callback('success....');
        };
        xhr.onerror = function() {
          callback(null);
        };
        xhr.send();
      } else {
        callback(null);
      }
    }
  },
};
</script>