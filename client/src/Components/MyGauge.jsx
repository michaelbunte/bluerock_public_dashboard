const f_svg_ellipse_arc = (([cx, cy], [rx, ry], [t1, Δ], φ) => {
    /* [
    Copyright © 2020 Xah Lee
    Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
    The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
    THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
    URL: SVG Circle Arc http://xahlee.info/js/svg_circle_arc.html
    Version 2019-06-19
    ] */
    const cos = Math.cos;
    const sin = Math.sin;
    const π = Math.PI;
    const f_matrix_times = (([[a, b], [c, d]], [x, y]) => [a * x + b * y, c * x + d * y]);
    const f_rotate_matrix = (x => [[cos(x), -sin(x)], [sin(x), cos(x)]]);
    const f_vec_add = (([a1, a2], [b1, b2]) => [a1 + b1, a2 + b2]);
    /* [
    returns a SVG path element that represent a ellipse.
    cx,cy → center of ellipse
    rx,ry → major minor radius
    t1 → start angle, in radian.
    Δ → angle to sweep, in radian. positive.
    φ → rotation on the whole, in radian
    URL: SVG Circle Arc http://xahlee.info/js/svg_circle_arc.html
    Version 2019-06-19
     ] */
    Δ = Δ % (2 * π);
    const rotMatrix = f_rotate_matrix(φ);
    const [sX, sY] = (f_vec_add(f_matrix_times(rotMatrix, [rx * cos(t1), ry * sin(t1)]), [cx, cy]));
    const [eX, eY] = (f_vec_add(f_matrix_times(rotMatrix, [rx * cos(t1 + Δ), ry * sin(t1 + Δ)]), [cx, cy]));
    const fA = ((Δ > π) ? 1 : 0);
    const fS = ((Δ > 0) ? 1 : 0);
    const path_2wk2r = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path_2wk2r.setAttribute("d", "M " + sX + " " + sY + " A " + [rx, ry, φ / (2 * π) * 360, fA, fS, eX, eY].join(" "));
    return path_2wk2r;
});

const valDefault = undefined;
const unitDefault = "";
const minDefault = 0;
const maxDefault = 50; 
const textScalarDefault = 1.4;
const rangesDefault = [[75, "g"], [25, "r"]];

export function MyGaugeSVGContents({
    val = valDefault,
    unit = unitDefault,
    min = minDefault,
    max = maxDefault,
    textScalar = textScalarDefault,
    ranges = rangesDefault}) {

    const colorMap = {
        "g": "#00a62c",
        "y": "#eae500",
        "r": "#df4040"
    }

    // written by chatgpt
    const mapNumber = (fromValue, fromMin, fromMax, toMin, toMax) => {
        fromValue = Math.max(fromMin, Math.min(fromMax, fromValue));
        const normalizedPosition = (fromValue - fromMin) / (fromMax - fromMin);
        const toValue = toMin + (toMax - toMin) * normalizedPosition;
        return toValue;
    }
    // written by chatgpt
    function getOrderOfMagnitude(number) {
        const positiveNumber = Math.abs(number);
        if (positiveNumber === 0) {
            return 0;
        }
        const orderOfMagnitude = Math.floor(Math.log10(positiveNumber));
        return orderOfMagnitude;
    }
    // written by chatgpt
    function roundToOrderOfMagnitude(number, targetOrder) {
        const currentOrder = getOrderOfMagnitude(number);
        const adjustmentFactor = Math.pow(10, targetOrder - currentOrder);
        const roundedNumber = Math.round(number * adjustmentFactor) / adjustmentFactor;
        return roundedNumber;
    }

    const maxOrderOfMag = getOrderOfMagnitude(Math.max(min, max)) + 3;
    const valCopy = val === undefined ? 0 : val;
    const PI = Math.PI;
    const mapGauge = (v) => mapNumber(v, 0, 100, 0, PI * 1.6);
    let needleAngle = mapNumber(val, min, max, 126, 414);

    let minGaugeValueExceeded = false;
    if (valCopy < min) { needleAngle = 115; minGaugeValueExceeded = true; };
    let maxGaugeValueExceeded = false;
    if (valCopy > max) { needleAngle = 65; maxGaugeValueExceeded = true; };

    let curPos = PI * 0.7;
    const rangeArcs = ranges.map(([range, color], index) => {
        const mappedRange = mapGauge(range);
        const arc = f_svg_ellipse_arc([0, 0], [77, 77], [curPos, mappedRange], 0);
        const arcPath = `${arc.getAttribute('d')}`;
        const strokeColor = color in colorMap ? colorMap[color] : color;
        curPos += mappedRange;
        return <path
            d={arcPath}
            stroke={strokeColor}
            fill="none"
            strokeWidth="8"
            key={`${range},${color},${index}`} />;
    });

    const outerArcPath = f_svg_ellipse_arc(
        [0, 0],
        [81, 81],
        [0.7 * Math.PI, 1.6 * Math.PI],
        0).getAttribute('d');
    const outerArc = <path
        d={outerArcPath}
        stroke="#404040"
        fill="none"
        strokeWidth="2" />


    const bigTickMarks = [];
    for (let i = 0; i < 5; i++) {
        bigTickMarks.push(
            <g
                key={`bt${i}`}
                transform={`rotate(${mapNumber(i, 0, 4, 126, 414)
                    })`}>
                <line x1="69" x2="82" y1="0" y2="0" strokeWidth="2" strokeLinecap="butt" stroke="#bfbfbf" />
            </g>
        )
    }
    const littleTickMarks = [];
    for (let i = 0; i < 20; i++) {
        if (i % 5 === 0) { continue; }
        littleTickMarks.push(
            <g
                key={`lt${i}`}
                transform={`rotate(${mapNumber(i, 0, 20, 126, 414)
                    })`}>
                <line x1="71" x2="82" y1="0" y2="0" strokeWidth="1" strokeLinecap="butt" stroke="grey" />
            </g>
        )
    }
    return (
        <g>
            <defs>
                <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{ stopColor: "rgb(220,220,220)", stopOpacity: "1" }} />
                    <stop offset="100%" style={{ stopColor: "rgb(200,200,200)", stopOpacity: "1" }} />
                </linearGradient>
                <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{ stopColor: "rgb(250,250,250)", stopOpacity: "1" }} />
                    <stop offset="100%" style={{ stopColor: "rgb(230,230,230)", stopOpacity: "1" }} />
                </linearGradient>
            </defs>
            <g transform="translate(100,100)">
                <circle cx="0" cy="0" fill="url(#grad1)" r="90" />
                <circle cx="0" cy="0" fill="#b7b7b7" r="88" />
                <circle cx="0" cy="0" fill="url(#grad2)" r="85" />
                <circle cx="0" cy="0" fill="black" r="5" />
                {rangeArcs}
                {outerArc}
                {bigTickMarks}
                {littleTickMarks}
                <text
                    fill="#505050"
                    x="-40" y="50"
                    textAnchor="start"
                    dominantBaseline="middle"
                    fontSize={`${1*textScalar}rem`}
                >{min}</text>
                <text
                    fill="#505050"
                    x="0" y="-70"
                    textAnchor="middle"
                    dominantBaseline="hanging"
                    fontSize={`${1*textScalar}rem`}
                    >{roundToOrderOfMagnitude(mapNumber(2, 0, 4, min, max), maxOrderOfMag)}</text>
                <text
                    fill="#505050"
                    x="-65" y="-19"
                    textAnchor="start"
                    dominantBaseline="middle"
                    fontSize={`${1*textScalar}rem`}
                    >{roundToOrderOfMagnitude(mapNumber(1, 0, 4, min, max), maxOrderOfMag)}</text>
                <text
                    fill="#505050"
                    x="65" y="-19"
                    textAnchor="end"
                    dominantBaseline="middle"
                    fontSize={`${1*textScalar}rem`}
                    >{roundToOrderOfMagnitude(mapNumber(3, 0, 4, min, max), maxOrderOfMag)}</text>
                <text
                    fill="#505050"
                    x="40" y="50"
                    textAnchor="end"
                    dominantBaseline="middle"
                    fontSize={`${1*textScalar}rem`}
                >{max}</text>
                {val !== null && val !== undefined &&
                    <g transform={`rotate(${needleAngle})`}>
                        <polygon points="-10,2, 65,1 68,0 65,-1 -10,-2" fill="black" />
                    </g>}
                <text
                    x="0" y="35"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    stroke="rgba(255,255,255,0.5)"
                    fontSize={`${1.45*textScalar}rem`}
                    strokeWidth="4"
                >{val} {unit}</text>
                <text
                    x="0" y="35"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    stroke="white"
                    fontSize={`${1.45*textScalar}rem`}
                    strokeWidth="2"
                >{val} {unit}</text>
                <text
                    x="0" y="35"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={`${1.45*textScalar}rem`}
                >{val} {unit}</text>
                {(minGaugeValueExceeded || maxGaugeValueExceeded) &&
                    <>
                        <text
                            x="0" y="-38"
                            textAnchor="middle"
                            dominantBaseline="middle"
                            fontSize="1.3rem"
                            fill="red"
                        >{minGaugeValueExceeded ? "MIN" : "MAX"}IMUM GAUGE</text>
                        <text
                            x="0" y="-25"
                            textAnchor="middle"
                            dominantBaseline="middle"
                            fontSize="1.3rem"
                            fill="red"
                        >VALUE EXCEEDED</text>
                    </>}
            </g>
        </g>
    )
}

export function MyGaugeSVG({
    val = valDefault,
    unit = unitDefault,
    min = minDefault,
    max = maxDefault,
    textScalar = textScalarDefault,
    ranges = rangesDefault }) {
    return (
        <svg width="100%" height="100%" viewBox="0 0 200 200">
            <MyGaugeSVGContents
                val={val}
                unit={unit}
                min={min}
                max={max}
                textScalar={textScalar}
                ranges={ranges}
            />
        </svg>
    )
}

export function MyGauge({ maxSize = 200,
    val = valDefault,
    unit = unitDefault,
    min = minDefault,
    max = maxDefault,
    textScalar = textScalarDefault,
    ranges = rangesDefault}) {
    return (
        <div style={{ maxWidth: `${maxSize}px`, width: "100%", margin: "0 auto" }}>
            <MyGaugeSVG
                val={val}
                unit={unit}
                min={min}
                max={max}
                textScalar={textScalar}
                ranges={ranges}
            />
        </div>
    )
}
