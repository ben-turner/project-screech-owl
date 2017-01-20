var inputBuffer = [],
stop = false

function run() {
	var code = document.getElementById("code").value
	var blob = atob(code)
	var data = new Uint8Array(blob.length)
	for (var i = 0; i < blob.length; i++) {
		data[i] = blob.charCodeAt(i)
		console.log(data[i].toString(16))
	}

	execute(data)
}

function execute(data) {
	var A = 0
	  , B = 0
	  , C = 0
	  , I = 0
	  , mem = []
	  , outputBuffer = []

	var interval = setInterval(function () {
		if (stop) {
			console.log("Terminated by stop: A: " + A + ", B: " + B + ", C: " + C + ", I: " + I)
			clearInterval(interval);
			return
		}
		switch (data[I]) {
			case 0x00:
				console.log("Terminated normally: A: " + A + ", B: " + B + ", C: " + C + ", I: " + I)
				stop = true
				clearInterval(interval);
				return
			case 0x01:
				console.log("Stat: A: " + A + ", B: " + B + ", C: " + C + ", I: " + I)
				break

			case 0x11:
				A = data[I+=1]
				break
			case 0x12:
				B = data[I+=1]
				break
			case 0x13:
				C = data[I+=1]
				break
			case 0x14:
				I = data[I+1]
				return
			case 0x15:
				B = A
				break
			case 0x16:
				C = A
				break
			case 0x17:
				I = A
				return
			case 0x18:
				A = B
				break
			case 0x19:
				C = B
				break
			case 0x1A:
				I = B
				return
			case 0x1B:
				A = C
				break
			case 0x1C:
				B = C
				break
			case 0x1D:
				I = C
				return
			case 0x1E:
				A = I
				break
			case 0x1F:
				B = I
				break
			case 0x20:
				C = I
				break
			case 0x21:
				ADDR = data[I+=1]
				mem[ADDR] = A
				break
			case 0x22:
				mem[ADDR] = B
				break
			case 0x23:
				mem[ADDR] = C
				break
			case 0x24:
				ADDR = data[I+=1]
				LEN = data[I+=1]
				console.log(ADDR+"Here"+LEN)
				for (var i = 0; i < LEN; i++) {
					mem[ADDR+i] = data[I+i]
				}
				I += LEN
				break
			case 0x25:
				A = mem[ADDR]
				break
			case 0x26:
				B = mem[ADDR]
				break
			case 0x27:
				C = mem[ADDR]
				break
			case 0x28:
				A = mem[B]
				break
			case 0x29:
				A = mam[C]
				break
			case 0x2A:
				B = mem[A]
				break
			case 0x2B:
				B = mem[C]
				break
			case 0x2C:
				C = mem[A]
				break
			case 0x2D:
				C = mem[B]
				break

			// ARITHMATIC
			case 0x30:
				C = A + B
				break
			case 0x31:
				C = A - B
				break
			case 0x32:
				C = A * B
				break
			case 0x33:
				C = A / B
				break
			case 0x34:
				C = A & B
				break
			case 0x35:
				C = A | B
				break
			case 0x36:
				C = A ^ B
				break
			case 0x37:
				C = A == B ? 0x01 : 0x00
				break
			case 0x38:
				C = A != B ? 0x01 : 0x00
				break
			case 0x39:
				C = A < B ? 0x01 : 0x00
				break
			case 0x3A:
				C = A > B ? 0x01 : 0x00
				break
			case 0x3B:
				C = A <= B ? 0x01 : 0x00
				break
			case 0x3C:
				C = A >= B ? 0x01 : 0x00
				break

			// CONTROL
			case 0x40:
				GOTO = data[I+=1]
				ELSE = data[I+=1]
				I = A > 0 ? GOTO : ELSE
				return
			case 0x41:
				GOTO = data[I+=1]
				ELSE = data[I+=1]
				I = A == 0 ? GOTO : ELSE
				return
			case 0x42:
				GOTO = data[I+=1]
				ELSE = data[I+=1]
				I = B > 0 ? GOTO : ELSE
				return
			case 0x43:
				GOTO = data[I+=1]
				ELSE = data[I+=1]
				I = B == 0 ? GOTO : ELSE
				return
			case 0x44:
				GOTO = data[I+=1]
				ELSE = data[I+=1]
				I = C > 0 ? GOTO : ELSE
				return
			case 0x45:
				GOTO = data[I+=1]
				ELSE = data[I+=1]
				I = C == 0 ? GOTO : ELSE
				return

			// IO
			case 0x50:
				outputBuffer.push(A)
				break
			case 0x51:
				outputBuffer.push(B)
				break
			case 0x52:
				outputBuffer.push(C)
				break
			case 0x53:
				console.log(String.fromCharCode(...outputBuffer))
				outputBuffer = []
				break
			case 0x54:
				A = inputBuffer.shift()
				break
			case 0x55:
				B = inputBuffer.shift()
				break
			case 0x56:
				C = inputBuffer.shift()
				break
			default:
				console.log("Unknown instruction! A: " + A + ", B: " + B + ", C: " + C + ", I: " + I)
				stop = true
				clearInterval(interval);
				return
		}
		I++
	}, 1)
}

function partialCompile(code) {
	var buf = []
	  , marks = []
	  , lines = code.split("\n")

	for (var i = 0; i < lines.length; i++) {
		line = lines[i].match(/^([A-Z]{2,5})/g)
		switch (line[1]) {
			case "MEML":
				buf.push(0x24)
				buf.push(parseInt(line[2]))
				buf.push(line[4].length)
				for (var i = 0; i < line[4].length; i++) {
					buf.push(line[4].charCodeAt(i))
				}
				break
			case "BMEMA":
				buf.push(0x28)
				break
			case "CATA":
				buf.push(0x50)
				break
			case "LSA":
				buf.push(0x11)
				buf.push(parseInt(line[2]))
				break
			case "ADD":
				buf.push(0x30)
				break
			case "STAT":
				buf.push(0x01)
				break
			case "CSB":
				buf.push(0x1c)
				break
			case "LE":
				buf.push(0x3B)
				break
			case "IFC":
				buf.push(0x44)
				buf.push(parseInt(line[2]))
				buf.push(parseInt(line[3]))
				break
			case "FLUSH":
				buf.push(0x53)
				break
			case "TERM":
				buf.push(0x00)
				break
			case "MARK":
				marks[parseInt(line[1])] = buf.length
		}
	}
}

document.onkeypress = function(e) {
	inputBuffer.push(e.keyCode);
}
