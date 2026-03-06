# ─── DynamoDB Tables ────────────────────────────────────────────────────────

resource "aws_dynamodb_table" "events" {
  name         = "${var.project_name}-events"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "id"

  attribute {
    name = "id"
    type = "S"
  }
}

resource "aws_dynamodb_table" "users" {
  name         = "${var.project_name}-users"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "email"

  attribute {
    name = "email"
    type = "S"
  }
}

# ─── Lambda IAM ─────────────────────────────────────────────────────────────

resource "aws_iam_role" "analytics_lambda" {
  name = "${var.project_name}-analytics-lambda"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action    = "sts:AssumeRole"
      Effect    = "Allow"
      Principal = { Service = "lambda.amazonaws.com" }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_basic" {
  role       = aws_iam_role.analytics_lambda.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_role_policy" "lambda_dynamo" {
  role = aws_iam_role.analytics_lambda.name

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Action = ["dynamodb:PutItem", "dynamodb:UpdateItem"]
      Resource = [
        aws_dynamodb_table.events.arn,
        aws_dynamodb_table.users.arn,
      ]
    }]
  })
}

# ─── Lambda Function ─────────────────────────────────────────────────────────

data "archive_file" "analytics" {
  type        = "zip"
  source_dir  = "${path.module}/lambda"
  output_path = "${path.module}/lambda.zip"
}

resource "aws_lambda_function" "analytics" {
  function_name    = "${var.project_name}-analytics"
  runtime          = "nodejs22.x"
  handler          = "index.handler"
  role             = aws_iam_role.analytics_lambda.arn
  filename         = data.archive_file.analytics.output_path
  source_code_hash = data.archive_file.analytics.output_base64sha256

  environment {
    variables = {
      TABLE_NAME       = aws_dynamodb_table.events.name
      USERS_TABLE_NAME = aws_dynamodb_table.users.name
    }
  }
}

# ─── API Gateway HTTP API ────────────────────────────────────────────────────

resource "aws_apigatewayv2_api" "analytics" {
  name          = "${var.project_name}-analytics"
  protocol_type = "HTTP"

  cors_configuration {
    allow_origins = ["*"]
    allow_methods = ["POST"]
    allow_headers = ["content-type"]
  }
}

resource "aws_apigatewayv2_integration" "analytics" {
  api_id                 = aws_apigatewayv2_api.analytics.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.analytics.invoke_arn
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "analytics" {
  api_id    = aws_apigatewayv2_api.analytics.id
  route_key = "POST /"
  target    = "integrations/${aws_apigatewayv2_integration.analytics.id}"
}

resource "aws_apigatewayv2_stage" "analytics" {
  api_id      = aws_apigatewayv2_api.analytics.id
  name        = "$default"
  auto_deploy = true
}

resource "aws_lambda_permission" "analytics_apigw" {
  statement_id  = "AllowAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.analytics.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.analytics.execution_arn}/*/*"
}
