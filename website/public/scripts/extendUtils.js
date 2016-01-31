// Helper function to load a shader
function loadShader(gl,sourceScriptId, type)
{
	var shaderHandle = gl.createShader(type);
	var error;

	if (shaderHandle != 0)
	{
		// Read the embedded shader from the document.
		var shaderSource = document.getElementById(sourceScriptId);

		if (!shaderSource)
		{
			throw("Error: shader script '" + sourceScriptId + "' not found");
		}

		// Pass in the shader source.
		gl.shaderSource(shaderHandle, shaderSource.text);

		// Compile the shader.
		gl.compileShader(shaderHandle);

		// Get the compilation status.
		var compiled = gl.getShaderParameter(shaderHandle, gl.COMPILE_STATUS);

		// If the compilation failed, delete the shader.
		if (!compiled)
		{
			error = gl.getShaderInfoLog(shaderHandle);
			gl.deleteShader(shaderHandle);
			shaderHandle = 0;
		}
	}

	if (shaderHandle == 0)
	{
		throw("Error creating shader " + sourceScriptId + ": " + error);
	}

	return shaderHandle;
}
// Helper function to link a program
function linkProgram(gl,vertexShader, fragmentShader)
{
	// Create a program object and store the handle to it.
	var programHandle = gl.createProgram();

	if (programHandle != 0)
	{
		// Bind the vertex shader to the program.
		gl.attachShader(programHandle, vertexShader);

		// Bind the fragment shader to the program.
		gl.attachShader(programHandle, fragmentShader);

		// Bind attributes
		gl.bindAttribLocation(programHandle, 0, "a_Position");
		gl.bindAttribLocation(programHandle, 1, "a_Color");

		// Link the two shaders together into a program.
		gl.linkProgram(programHandle);

		// Get the link status.
		var linked = gl.getProgramParameter(programHandle, gl.LINK_STATUS);

		// If the link failed, delete the program.
		if (!linked)
		{
			gl.deleteProgram(programHandle);
			programHandle = 0;
		}
	}

	if (programHandle == 0)
	{
		throw("Error creating program.");
	}

	return programHandle;
}
