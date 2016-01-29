THREE.prototype.loadCustomObject = function(customObjectUrl, onComplete, randomColor) {
        var loader = new THREE.JSONLoader();
        loader.load(customObjectUrl, function (geometry, materials) {
            for (var i = 0; i < materials.length; i++) {
                materials[i].shading = THREE.FlatShading;
            }
            var material = new THREE.MeshFaceMaterial(materials);
            if (randomColor) {
                var r = Math.floor(Math.random() * 255);
                var g = Math.floor(Math.random() * 255);
                var b = Math.floor(Math.random() * 255);
                var color = new THREE.Color("rgb(" + r + "," + g + "," + b + ")");
                materials[0].color = color;
            }
            var object = new THREE.Mesh(geometry, material);
            if (typeof (onComplete) != "undefined") {
                onComplete(object);
            }
        });
    }
