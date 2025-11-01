import { composeController } from '@gaman/core';

export default composeController(() => ({
	async Home(ctx) {
		const data = {
			name: 'Angga',
			umur: 21,
		};

		return Res.html(`
			<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>App</title>
</head>
<body>
  <div id="root"></div>

  <script>
    window.__GAMAN_DATA__ = ${JSON.stringify(data)};
  </script>

  <script type="module" src="/_gaman/views/Home.js"></script>
</body>
</html>
		`);
	},
}));
