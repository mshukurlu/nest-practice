import {Catch, HttpException, ExceptionFilter, ArgumentsHost, Logger, HttpStatus} from '@nestjs/common';

@Catch()
export class HttpErrorFilter implements ExceptionFilter
{
    catch(exception:HttpException,host:ArgumentsHost)
    {
        const ctx = host.switchToHttp();

        const request = ctx.getRequest();

        const response = ctx.getResponse();

        const status = exception.getStatus ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

        const errorResponse = {
            code:status,
            timestamp:new Date().toLocaleDateString(),
            path:request.url,
            method:request.method,
            message:(status !== HttpStatus.INTERNAL_SERVER_ERROR) ? (exception.message.error || exception.message || null) : 'Internal server error'
        }

        Logger.error(`${request.method} ${request.url}`,JSON.stringify(errorResponse),'ExceptionFiler');

        response.status(status).json(errorResponse);
    }
}