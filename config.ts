
////////////////////////////////////
// types.ts
////////////////////////////////////
import * as t from "io-ts"

export const TConfig = t.type({
    server_url: t.string,
    account_id: t.string,
    http_port: t.number
});

export type Config = t.TypeOf<typeof TConfig>;


////////////////////////////////////
// config.ts
////////////////////////////////////
import {promises as fs} from "fs"
import * as E from "fp-ts/Either"
import * as TE from "fp-ts/TaskEither"
import { pipe } from "fp-ts/pipeable"
import { failure } from "io-ts/PathReporter"


export function loadConfig(filepath): TE.TaskEither<Error, Config> {
    
    const readConfigFile: TE.TaskEither<Error, string> = 
            TE.tryCatch(() => fs.readFile(filepath, { encoding: "utf-8"}), E.toError );
    
    const parseConfigJson = (content:string): E.Either<Error, E.Json> => {
        return E.parseJSON(content, E.toError);
    }

    const validateConfig = (json:E.Json):  E.Either<Error, Config> => {
        return pipe(
            TConfig.decode(json),
            E.mapLeft( errors => new Error(failure(errors).join(", ")))
        );
    }
            
    return pipe(
        readConfigFile,
        TE.chainEitherK(parseConfigJson),
        TE.chainEitherK(validateConfig)
    );
} 


