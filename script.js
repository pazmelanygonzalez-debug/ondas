// --- Simulación de ondas mecánicas ---

// Referencias a elementos del DOM
const inputA = document.getElementById('amplitud');
const inputF = document.getElementById('frecuencia');
const inputT = document.getElementById('periodo');
const inputV = document.getElementById('velocidad');
const inputL = document.getElementById('longitud');
const inputFunc = document.getElementById('funcion');
const btnAgregar = document.getElementById('agregar-onda');
const canvasesDiv = document.getElementById('canvases-ondas');
const ecuacionesDiv = document.getElementById('ecuaciones-ondas');

const colores = ['#1976d2', '#d32f2f', '#388e3c', '#fbc02d', '#7b1fa2', '#0097a7', '#c2185b', '#ffa000'];
let colorIndex = 0;
let ondas = [];

// --- Sincronización automática de campos ---
function actualizarCampos(campo) {
	let f = parseFloat(inputF.value);
	let T = parseFloat(inputT.value);
	let v = parseFloat(inputV.value);
	let l = parseFloat(inputL.value);
	if (campo === 'frecuencia' && !isNaN(f) && f > 0) {
		inputT.value = (1 / f).toFixed(4);
		if (!isNaN(v)) inputL.value = (v / f).toFixed(4);
		if (!isNaN(l) && l > 0) inputV.value = (l * f).toFixed(4);
	}
	if (campo === 'periodo' && !isNaN(T) && T > 0) {
		inputF.value = (1 / T).toFixed(4);
		f = 1 / T;
		if (!isNaN(v)) inputL.value = (v / f).toFixed(4);
		if (!isNaN(l) && l > 0) inputV.value = (l * f).toFixed(4);
	}
	if (campo === 'velocidad' && !isNaN(v) && v > 0) {
		if (!isNaN(f) && f > 0) inputL.value = (v / f).toFixed(4);
		if (!isNaN(l) && l > 0) inputF.value = (v / l).toFixed(4);
	}
	if (campo === 'longitud' && !isNaN(l) && l > 0) {
		if (!isNaN(f) && f > 0) inputV.value = (l * f).toFixed(4);
		if (!isNaN(v) && v > 0) inputF.value = (v / l).toFixed(4);
	}
}
inputF.addEventListener('input', () => actualizarCampos('frecuencia'));
inputT.addEventListener('input', () => actualizarCampos('periodo'));
inputV.addEventListener('input', () => actualizarCampos('velocidad'));
inputL.addEventListener('input', () => actualizarCampos('longitud'));

// --- Agregar onda ---
btnAgregar.addEventListener('click', () => {
	const A = parseFloat(inputA.value);
	const f = parseFloat(inputF.value);
	const T = parseFloat(inputT.value);
	const v = parseFloat(inputV.value);
	let l = parseFloat(inputL.value);
	const funcion = inputFunc.value;
	if (isNaN(A) || isNaN(f) || isNaN(T) || isNaN(v)) return;
	if (isNaN(l) || l <= 0) l = v / f;
	ondas.push({
		A, f, T, v, l, funcion,
		color: colores[colorIndex % colores.length]
	});
	colorIndex++;
	renderOndas();
});

// --- Renderizar todas las ondas ---
function renderOndas() {
	canvasesDiv.innerHTML = '';
	ecuacionesDiv.innerHTML = '';
	ondas.forEach((onda, idx) => {
		// Canvas
		const canvas = document.createElement('canvas');
		canvas.width = 800;
		canvas.height = 200;
		canvas.style.marginBottom = '24px';
		canvas.style.background = '#fff';
		canvas.style.borderRadius = '10px';
		canvas.style.boxShadow = '0 2px 8px rgba(0,0,0,0.07)';
		canvasesDiv.appendChild(canvas);
		drawOnda(canvas, onda);
		// Ecuación
		const funcTxt = onda.funcion === 'cos' ? 'cos' : 'sin';
		const eq = `y(x) = ${onda.A}·${funcTxt}(2π·${onda.f}·(x/${onda.v}))`;
		const p = document.createElement('p');
		p.innerHTML = `<span style="display:inline-block;width:16px;height:16px;background:${onda.color};border-radius:3px;margin-right:6px;"></span> <b>Onda ${idx+1}:</b> ${eq}`;
		ecuacionesDiv.appendChild(p);
	});
}

// --- Dibujar una onda en su canvas ---
function drawOnda(canvas, onda) {
	const ctx = canvas.getContext('2d');
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.save();
	// Ejes
	ctx.strokeStyle = '#444';
	ctx.lineWidth = 1.5;
	ctx.beginPath(); ctx.moveTo(40, 100); ctx.lineTo(790, 100); ctx.stroke();
	ctx.beginPath(); ctx.moveTo(50, 20); ctx.lineTo(50, 180); ctx.stroke();
	ctx.fillStyle = '#222'; ctx.font = '14px Arial';
	ctx.fillText('x', 780, 90);
	ctx.fillText('y', 55, 30);
	// Etiquetas de amplitud
	ctx.fillStyle = onda.color;
	ctx.font = '13px Arial';
	ctx.fillText('+' + onda.A, 10, 100 - onda.A * 80 + 5);
	ctx.fillText('-' + onda.A, 10, 100 + onda.A * 80 + 5);
	ctx.strokeStyle = onda.color;
	ctx.beginPath();
	ctx.moveTo(45, 100 - onda.A * 80);
	ctx.lineTo(55, 100 - onda.A * 80);
	ctx.moveTo(45, 100 + onda.A * 80);
	ctx.lineTo(55, 100 + onda.A * 80);
	ctx.stroke();
	// Onda
	ctx.beginPath();
	let faseInicial = 0;
	// Para seno, no sumar fase: así inicia en (0,0)
	for (let x = 0; x <= 740; x++) {
		const xReal = x + 50;
		let y;
		const k = 2 * Math.PI / onda.l;
		if (onda.funcion === 'cos') {
			y = onda.A * 80 * Math.cos(k * x);
		} else {
			y = onda.A * 80 * Math.sin(k * x); // inicia en (0,0)
		}
		const yReal = 100 - y;
		if (x === 0) ctx.moveTo(xReal, yReal);
		else ctx.lineTo(xReal, yReal);
	}
	ctx.strokeStyle = onda.color;
	ctx.lineWidth = 3;
	ctx.globalAlpha = 1;
	ctx.stroke();
	ctx.restore();
}
