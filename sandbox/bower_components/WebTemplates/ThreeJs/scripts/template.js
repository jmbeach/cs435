function $TEMPLATE$() {
    //#region GLOBALS
    //#region THREE_JS_TEMPLATE_VARS
    var camera, scene, renderer, directionalLight;
    var geometry, material, mesh;
    var self = this;
    //#endregion
    //#endregion

    //#region EVENTS
    $(function () { //(on load)
        setup();
        draw();
    });

    function setup() { // called once at page load
        //#region THREE_JS_PLAYGROUND_TEMPLATE
        var W = window.innerWidth, H = window.innerHeight;
        renderer = new THREE.WebGLRenderer({ preserveDrawingBuffer: true });
        renderer.setSize(W, H);
        renderer.autoClearColor = false;
        document.body.appendChild(renderer.domElement);

        camera = new THREE.PerspectiveCamera(50, W / H, 1, 10000);
        camera.position.z = 500;

        scene = new THREE.Scene();

        var ambient = new THREE.AmbientLight(0x101030);
        scene.add(ambient);
        directionalLight = new THREE.DirectionalLight(0xffeedd);
        directionalLight.position.set(141, -177, 363);
        scene.add(directionalLight);
        //#endregion

        //#region CUSTOM_LOAD

        //#endregion

    }

    function draw() { // update function draws new frames

        // #region TEMPLATE_CODE
        requestAnimationFrame(draw);
        // #endregion

        // #region CUSTOM_DRAW

        // #endregion custom draw

        // #region TEMPLATE_CODE
        renderer.render(scene, camera);
        // #endregion

    }
    //#endregion


    //#region FUNCTIONS

    //#endregion
}