
function Scene(options) {
    this.Name = options.name;
    this.Order = options.order;
}

$.Scene = {
    findScene: function(scenes,sceneName) {
        var foundScene = null;
        scenes.forEach(function(scene) {
            if (scene.Name == sceneName) {
                foundScene = scene;
            }
        });
        return foundScene;
    }
};