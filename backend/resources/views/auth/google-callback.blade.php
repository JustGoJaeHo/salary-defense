<!doctype html>
<html lang="ko">
<head>
    <meta charset="utf-8">
    <title>Google Login</title>
</head>
<body>
    <script>
        const result = @json($result);

        if (window.opener) {
            window.opener.postMessage(result, '{{ config('services.frontend.url') }}');
        }

        window.close();
    </script>
</body>
</html>
