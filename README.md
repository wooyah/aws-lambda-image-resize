# aws-lambda-image-resize
S3에 있던 이미지들을 백업하고, 원하는 사이즈로 리사이징해서 다시 S3에 업로드

이미지 처리되는걸 순서대로 확인하면서 체크합니다.

특정 날짜 이후에 생성된 이미지들만 가져와서 백업 폴더에 원본을 옮기고, 리사이징한 이미지를 버킷에 올립니다.

> test on local
$ serverless invoke local --function resizeImage --aws-profile [PROFILENAME]

> deploy
$ serverless deploy --aws-profile [PROFILENAME]
