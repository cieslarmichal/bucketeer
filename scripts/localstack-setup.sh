#!/bin/bash

echo "CREATING S3 BUCKETS"

awslocal s3 mb s3://resources1
awslocal s3 mb s3://resources2

echo "S3 BUCKETS CREATED"

awslocal s3 ls

echo "CREATING S3 OBJECTS"

awslocal s3 cp /usr/share/app/resources/sample_image1.mp4 s3://videos/sample_image1.mp4
awslocal s3 cp /usr/share/app/resources/sample_video1.mp4 s3://videos/sample_video1.mp4

awslocal s3 cp /usr/share/app/resources/sample_image2.mp4 s3://videos/sample_image2.mp4
awslocal s3 cp /usr/share/app/resources/sample_video2.mp4 s3://videos/sample_video2.mp4

echo "S3 OBJECTS CREATED"

