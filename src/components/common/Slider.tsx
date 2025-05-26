import React from "react";
import { Slider, Rail, Handles, Tracks, Ticks } from "react-compound-slider";
import { addCommas, formatNumberWithSuffix } from "@/utils/helper";

export function Handle({ handle: { id, value, percent }, getHandleProps }: any) {
    return (
        <div
            style={{
                left: `${percent}%`,
                position: "absolute",
                marginLeft: -8,
                marginTop: 8,
                zIndex: 2,
                width: 16,
                height: 16,
                textAlign: "center",
                cursor: "pointer",
                borderRadius: "50%",
                border: "2px solid #25FCFC",
                backgroundColor: "black",
                color: "#333",
            }}
            {...getHandleProps(id)}
        >
            {/* <div style={{ fontFamily: "Roboto", fontSize: 11, marginTop: -35 }}>{value}</div> */}
        </div>
    );
}

function Track({ source, target, getTrackProps }: any) {
    return (
        <div
            style={{
                position: "absolute",
                height: 2,
                zIndex: 1,
                marginTop: 15,
                backgroundColor: "#25FCFC",
                borderRadius: 5,
                cursor: "pointer",
                left: `${source.percent}%`,
                width: `${target.percent - source.percent}%`,
            }}
            {...getTrackProps()}
        />
    );
}

function Tick({ tick, count }: any) {
    return (
        <div>
            <div
                style={{
                    position: "absolute",
                    marginTop: 12,
                    marginLeft: -0.5,
                    width: 1,
                    height: 10,
                    backgroundColor: "#25FCFC",
                    left: `${tick.percent}%`,
                }}
            />
            <div
                style={{
                    position: "absolute",
                    marginTop: 25,
                    fontSize: 10,
                    textAlign: "center",
                    marginLeft: `${-(100 / count) / 2}%`,
                    width: `${100 / count}%`,
                    left: `${tick.percent}%`,
                }}
            >
                ${formatNumberWithSuffix(tick.value)}
            </div>
        </div>
    );
}

const sliderStyle = {
    // Give the slider some width
    position: "relative",
    width: "100%",
    height: 40,
};

const railStyle = {
    position: "absolute",
    width: "100%",
    height: 2,
    marginTop: 15,
    borderRadius: 5,
    backgroundColor: "#25FCFC88",
};

function SliderHandler({ marketCapBuyRange, setMarketCapBuyRange }: { marketCapBuyRange: number; setMarketCapBuyRange: (value: number) => void }) {
    return (
        <Slider rootStyle={sliderStyle} domain={[0, 10000000]} step={500000} values={[marketCapBuyRange]} onUpdate={(values) => setMarketCapBuyRange(values[0])}>
            <div style={railStyle as any} />
            <Handles>
                {({ handles, getHandleProps }) => (
                    <div className="slider-handles">
                        {handles.map((handle) => (
                            <Handle key={handle.id} handle={handle} getHandleProps={getHandleProps} />
                        ))}
                    </div>
                )}
            </Handles>
            <Tracks right={false}>
                {({ tracks, getTrackProps }) => (
                    <div className="slider-tracks">
                        {tracks.map(({ id, source, target }) => (
                            <Track key={id} source={source} target={target} getTrackProps={getTrackProps} />
                        ))}
                    </div>
                )}
            </Tracks>
            <Ticks values={[0, 2000000, 4000000, 6000000, 8000000, 10000000]}>
                {({ ticks }) => (
                    <div className="slider-ticks">
                        {ticks.map((tick) => (
                            <Tick key={tick.id} tick={tick} count={ticks.length} />
                        ))}
                    </div>
                )}
            </Ticks>
        </Slider>
    );
}

export default SliderHandler;
