// Draw from the accessible HTML cards so copy and SVG symbols have one source.
// This function also renders in a native canvas for artwork review without WebGL.
export function drawSpecialtyCard(ctx, card, colors, SymbolPath = Path2D) {
  const { width, height } = ctx.canvas;
  ctx.save();
  ctx.scale(width / 1200, height / 800);
  ctx.fillStyle = colors.surface;
  ctx.fillRect(0, 0, 1200, 800);
  ctx.strokeStyle = colors.line;
  ctx.lineWidth = 2;
  ctx.strokeRect(24, 24, 1152, 752);

  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = colors.accent;
  ctx.font = '500 25px "Inter", sans-serif';
  ctx.fillText(card.number, 70, 108);
  ctx.fillStyle = colors.text;
  ctx.font = '500 88px "Space Grotesk", sans-serif';
  card.title.forEach((line, i) => ctx.fillText(line, 66, 267 + i * 96, 740));
  ctx.font = '400 31px "Inter", sans-serif';
  ctx.fillText(card.description, 70, 525, 1060);

  ctx.beginPath();
  ctx.moveTo(70, 611);
  ctx.lineTo(1130, 611);
  ctx.stroke();
  ctx.font = '500 23px "Inter", sans-serif';
  ctx.fillText(card.tag, 70, 710, 980);
  ctx.fillStyle = colors.accent;
  ctx.beginPath();
  ctx.arc(1108, 702, 7, 0, Math.PI * 2);
  ctx.fill();

  ctx.translate(835, 190);
  ctx.scale(1.1, 1.1);
  ctx.strokeStyle = colors.accent;
  ctx.lineWidth = 2;
  ctx.lineJoin = "round";
  ctx.stroke(new SymbolPath(card.symbol));
  ctx.restore();
}
