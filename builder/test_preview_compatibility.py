"""Deployment check for the native Frappe v16 preview implementation."""

from io import BytesIO

from PIL import Image

from builder.html_preview_image import render_full_page


def run_checks():
	html = '<html><body style="margin:0"><div style="height:1500px;background:#ddd">Preview check</div></body></html>'
	image = Image.open(BytesIO(render_full_page(html, width=800, height=600, max_height=2000)))
	assert image.size == (800, 1500), f"Full-page preview was cropped: {image.size}"
	return {"width": image.width, "height": image.height, "status": "passed"}
