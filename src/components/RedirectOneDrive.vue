<template>
    <div/>
</template>
<script>
export default {
    name: 'RedirectOneDrive',
    beforeMount() {
        const scriptEl2 = document.createElement('script');
        scriptEl2.setAttribute('id', `onedrive`);
        scriptEl2.setAttribute('src','https://js.live.net/v7.2/OneDrive.js');
        document.body.appendChild(scriptEl2);
    },
}
</script>