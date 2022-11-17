<template>
    <div>
        <button id="authorize_button" @click="handleAuthClick()">Authorize</button><br>
        <button id="signout_button" @click="handleSignoutClick()">Sign Out</button><br>
        <br>
        <form enctype="multipart/form-data" method="post" action="https://ac9e-103-105-82-205.ap.ngrok.io/drive-picker/get.php">
            <input type="file" name="google_file" placeholder="Pilih filenya"/><br>
            <button type="submit">Kirim Coba</button>
        </form>
        <pre id="content" style="white-space: pre-wrap;"></pre>
    </div>
</template>
<script>

import { config } from '@/config'

export default {
    name: 'GooglePicker',
    data: () => ({
        idElement: 'google-picker',
        tokenClient: null,
        accessToken: null,
        pickerInited: false,
        gisInited: false,
        CLIENT_ID: config.google_client_id,
        API_KEY: config.google_api_key,
        APP_ID: config.google_app_id,
    }),
    computed: {
        SCOPES() {
            const localScopes = [
                'https://www.googleapis.com/auth/drive',
                'https://www.googleapis.com/auth/drive.file',
                'https://www.googleapis.com/auth/drive.readonly',
                'https://www.googleapis.com/auth/drive.metadata.readonly',
                'https://www.googleapis.com/auth/drive.appdata',
                'https://www.googleapis.com/auth/drive.metadata',
                'https://www.googleapis.com/auth/drive.photos.readonly',
            ];
            return localScopes.join(' ');
        },
    },
    beforeMount() {
        const scriptEl1 = document.createElement('script');
        scriptEl1.setAttribute('id', `${this.idElement}-api`);
        scriptEl1.setAttribute('src','https://apis.google.com/js/api.js');
        scriptEl1.setAttribute('async', true);
        scriptEl1.setAttribute('defer', true);

        const scriptEl2 = document.createElement('script');
        scriptEl2.setAttribute('id', `${this.idElement}-client`);
        scriptEl2.setAttribute('src','https://accounts.google.com/gsi/client');
        scriptEl2.setAttribute('async', true);
        scriptEl2.setAttribute('defer', true);

        document.body.appendChild(scriptEl1);
        document.body.appendChild(scriptEl2);
        
    },
    mounted() {
        setTimeout(() => {
            this.gapiLoaded();
            this.gisLoaded();
            document.getElementById('authorize_button').style.visibility = 'hidden';
            document.getElementById('signout_button').style.visibility = 'hidden';
        }, 1000);
        
    },
    beforeDestroy() {
        document.getElementById(`${this.idElement}-api`).remove();
        document.getElementById(`${this.idElement}-client`).remove();
    },
    methods: {
        gapiLoaded() {
            window.gapi.load('client:picker', this.intializePicker);
        },
        gisLoaded() {
            console.log('gis loaded');
            this.tokenClient = window.google.accounts.oauth2.initTokenClient({
                client_id: this.CLIENT_ID,
                scope: this.SCOPES,
                callback: () => {}, // defined later
            });
            console.log(this.tokenClient);
            this.gisInited = true;
            this.maybeEnableButtons();
        },
        async intializePicker() {
            await gapi.client.load('https://www.googleapis.com/discovery/v1/apis/drive/v3/rest');
            this.pickerInited = true;
            this.maybeEnableButtons();
        },
        maybeEnableButtons() {
            if (this.pickerInited && this.gisInited) {
                document.getElementById('authorize_button').style.visibility = 'visible';
            }
        },
        handleAuthClick() {
            this.tokenClient.callback = async (response) => {
                if (response.error !== undefined) {
                    throw (response);
                }
                this.accessToken = response.access_token;
                document.getElementById('signout_button').style.visibility = 'visible';
                document.getElementById('authorize_button').innerText = 'Refresh';
                await this.createPicker();
            };

            if (this.accessToken === null) {
                // Prompt the user to select a Google Account and ask for consent to share their data
                // when establishing a new session.
                this.tokenClient.requestAccessToken({prompt: 'consent'});
            } else {
                // Skip display of account chooser and consent dialog for an existing session.
                this.tokenClient.requestAccessToken({prompt: ''});
            }
        },
        handleSignoutClick() {
            if (this.accessToken) {
                this.accessToken = null;
                window.google.accounts.oauth2.revoke(this.accessToken);
                document.getElementById('content').innerText = '';
                document.getElementById('authorize_button').innerText = 'Authorize';
                document.getElementById('signout_button').style.visibility = 'hidden';
            }
        },
        createPicker() {
            // const view = new google.picker.View(google.picker.ViewId.DOCS);
            const view = new window.google.picker.DocsView().setParent('root').setIncludeFolders(true);
            const picker = new window.google.picker.PickerBuilder()
                .enableFeature(window.google.picker.Feature.NAV_HIDDEN)
                .enableFeature(window.google.picker.Feature.MULTISELECT_ENABLED)
                .setDeveloperKey(this.API_KEY)
                .setAppId(this.APP_ID)
                .setOAuthToken(this.accessToken)
                .addView(view)
                .addView(new google.picker.DocsUploadView())
                .setCallback(this.pickerCallback)
                .build();
            picker.setVisible(true);
        },
        async pickerCallback(data) {
            if (data.action === google.picker.Action.PICKED) {
                let text = `Picker response: \n${JSON.stringify(data, null, 2)}\n`;
                const document = data[google.picker.Response.DOCUMENTS][0];
                const fileId = document[google.picker.Document.ID];
                console.log(document);
                const res = await gapi.client.drive.files.get({
                    'fileId': fileId,
                    'fields': '*',
                });
                text += `Drive API response for first document: \n${JSON.stringify(res.result, null, 2)}\n`;
                window.document.getElementById('content').innerText = text;
                this.downloadFile(document, e => console.log(e));
            }
        },
        downloadFile(file, callback) {
            console.log('downloading file.......');
            if (file) {
                const fileId = file[google.picker.Document.ID];
                const fileInput = document.querySelector('input[type="file"]');
                var accessToken = gapi.auth.getToken().access_token;
                console.log('send request.......');
                var xhr = new XMLHttpRequest();
                xhr.open('GET', `https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=application/pdf`);
                xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken);
                xhr.responseType = "blob";
                xhr.onload = function() {
                    const blob = xhr.response;
                    const myFile = new File([blob], file.name + '.pdf', {
                        type: 'application/pdf',
                        lastModified: new Date(file.lastEditedUtc),
                    });

                    const dataTransfer = new DataTransfer();
                    dataTransfer.items.add(myFile);
                    fileInput.files = dataTransfer.files;
                };
                xhr.onerror = function() {
                    callback(null);
                };
                xhr.send();
            } else {
            callback(null);
            }
        },

    },
};
</script>
