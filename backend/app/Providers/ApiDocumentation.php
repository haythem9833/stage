<?php

namespace App\Providers;

/**
 * @OA\Info(title="CNI Formation API", version="1.0.0")
 * @OA\OpenApi(
 *   @OA\Info(
 *     title="CNI Formation API",
 *     version="1.0.0",
 *     description="API de gestion des formations du CNI"
 *   ),
 *   @OA\Server(url="http://localhost:8000", description="Local API Server")
 * )
 * @OA\SecurityScheme(
 *     type="http",
 *     name="bearer",
 *     in="header",
 *     scheme="bearer",
 *     bearerFormat="JWT",
 *     securityScheme="bearer",
 *     description="Bearer token authentication"
 * )
 * @OA\PathItem(path="/api")
 */
class ApiDocumentation
{
}
