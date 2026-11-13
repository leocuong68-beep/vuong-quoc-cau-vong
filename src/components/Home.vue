<template>
  <NavPage>
    <LinkTile
      title="Princess"
      nav-path="/princess"
      src="img/games/Princess.png"
      alt="princess and pony games"
    />
    <LinkTile
      title="Memory"
      nav-path="/memory"
      src="img/games/MemoryBackface.png"
      alt="memory games"
    />
    <LinkTile
      title="Drag & Drop"
      nav-path="/dragdrop"
      src="img/games/DD.png"
      alt="drag and drop games"
    />
    <LinkTile
      title="Numbers"
      nav-path="/misc"
      src="img/games/Calculate.png"
      alt="Other uncategorized games"
    />
  </NavPage>
</template>

<script>
  import NavPage from './NavPage.vue';
  import LinkTile from './LinkTile.vue';

  export default {
    name: 'Home',
    components: { LinkTile, NavPage },
    props: {
      msg: String,
    },
  };
</script>

<style scoped></style>
