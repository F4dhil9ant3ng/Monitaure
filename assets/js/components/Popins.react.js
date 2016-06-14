define(['react', '../actions/PopinsActions', '../stores/PopinsStore'], function(React, PopinsActions, PopinsStore) {

    function getPopinsState() {
        return {
            allPopins: PopinsStore.getAll()
        };
    }

    class Popin extends React.Component {
        constructor(props) {
            super(props);
        }
        componentDidMount() {
            setTimeout(() => {
                PopinsActions.destroy(this.props.data.id);
            }, 3000);
        }

        render() {
            return (
                <div data-type={this.props.data.type} className="pop-in">
                    <p className="content">{this.props.data.text}</p>
                    <div className="close-popin" onClick={this._onDestroyClick.bind(this)}></div>
                </div>
            );
        }

        _onDestroyClick() {
            PopinsActions.destroy(this.props.data.id);
        }
    }

    class Popins extends React.Component {
        constructor() {
            super();
            this.state = getPopinsState();
        }
        componentDidMount() {
            PopinsStore.addChangeListener(this._onChange.bind(this));
        }
        componentWillUnmount() {
            PopinsStore.removeChangeListener(this._onChange.bind(this));
        }

        render() {
            if (Object.keys(this.state.allPopins).length < 1) {
                return null;
            }

            const allPopins = this.state.allPopins;
            const popins = [];

            for (const key in allPopins) {
                if (allPopins.hasOwnProperty(key)) {
                    popins.push(<Popin data={allPopins[key]} key={allPopins[key].id} />);
                }
            }

            return (
                <div>{popins}</div>
            );
        }

        _onChange() {
            this.setState(getPopinsState());
        }
    }

    return Popins;
});
