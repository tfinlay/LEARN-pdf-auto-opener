import React, {useCallback, useEffect, useState} from "react";
import {Button, Card, CardContent, Snackbar, Typography} from "@material-ui/core";
import {LOCAL_KEYS, SHARE_URL} from "../constant";
import {browser} from "webextension-polyfill-ts";

interface ShareState {
    hasShared: boolean,
}
export const Share = () => {
    const [state, setState] = useState<ShareState>( {
        hasShared: false
    })


    const onShareClick = useCallback(() => {
        navigator.clipboard.writeText(SHARE_URL)

        setState({
            ...state,
            hasShared: true
        })
    }, [state, setState])

    const handleSnackbarClose = useCallback((event: React.SyntheticEvent | React.MouseEvent, reason?: string) => {
        setState({
            ...state,
            hasShared: false
        })
    }, [state, setState])

    return (
        <>
            <Card variant="outlined">
                <CardContent>
                    <Typography variant="h5">Share</Typography>

                    <Typography variant="body1">
                        Like this? Spread the word!
                        <Button onClick={onShareClick} variant="contained" color="primary" style={{marginLeft: 8, verticalAlign: "middle"}}>Copy download link</Button>
                    </Typography>
                </CardContent>
            </Card>

            <Snackbar
                open={state.hasShared}
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'center'
                }}
                onClose={handleSnackbarClose}
                autoHideDuration={6000}
                message={
                    <Typography variant="body1">
                        Thanks for sharing!
                    </Typography>
                }
            />
        </>
    )
}