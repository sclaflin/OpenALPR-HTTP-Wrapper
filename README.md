# Open ALPR HTTP Wrapper #

Just a small wrapper around the Open ALPR cli binary.

Simply send and HTTP Post of image data to `/detect` and get back JSON results from the attempted detection.

## Installation ##

A docker image is available via:
```bash
docker pull sclaflin/open-alpr-http-wrapper
```

Docker Compose:

```yaml
version: "3.9"
services:
  frigate:
    container_name: open-alpr-http-wrapper
    restart: unless-stopped
    image: sclaflin/open-alpr-http-wrapper:latest
    ports:
      - "3000:3000"
```

## Usage ##

Post image data to the /detect endpoint:

```bash
curl -F upload=@car0.png http://localhost:3000/detect
```

The following output is returned:

```json
{
	"version": 2,
	"data_type": "alpr_results",
	"epoch_time": 1638566810336,
	"img_width": 1289,
	"img_height": 744,
	"processing_time_ms": 146.275497,
	"regions_of_interest": [],
	"results": [
		{
			"plate": "YZ88658",
			"confidence": 85.818779,
			"matches_template": 0,
			"plate_index": 0,
			"region": "",
			"region_confidence": 0,
			"processing_time_ms": 12.290022,
			"requested_topn": 10,
			"coordinates": [
				{
					"x": 682,
					"y": 342
				},
				{
					"x": 805,
					"y": 346
				},
				{
					"x": 801,
					"y": 400
				},
				{
					"x": 680,
					"y": 396
				}
			],
			"candidates": [
				{
					"plate": "YZ88658",
					"confidence": 85.818779,
					"matches_template": 0
				},
				{
					"plate": "Y288658",
					"confidence": 85.352005,
					"matches_template": 0
				},
				{
					"plate": "YZ8B658",
					"confidence": 83.173759,
					"matches_template": 0
				},
				{
					"plate": "Y28B658",
					"confidence": 82.706985,
					"matches_template": 0
				},
				{
					"plate": "YZ8865B",
					"confidence": 78.087212,
					"matches_template": 0
				}
			]
		}
	]
}
```

The root of the server also presents a form that you can use via web browser to upload and detect files.