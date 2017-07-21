defmodule Rumbl.Repo do
  @moduledoc """
  In memory repository
  """

  alias Rumbl.User

  def all(User) do
    [
      %User{id: "1", name: "Jose Valim", username: "joseevalim", password: "elixir"},
      %User{id: "2", name: "Bruce Wayne", username: "brucewayne", password: "elixir"},
      %User{id: "3", name: "Chris Mccord", username: "chrismccord", password: "elixir"}
    ]
  end

  def all(_module), do: []

  def get(module, id) do
    Enum.find all(module), fn map -> map.id == id end
  end

  def get_by(module, params) do
    Enum.find all(module), fn map ->
      Enum.all?(params, fn {key, val} -> Map.get(map, key) == val end)
    end
  end
end
